import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ServerTodo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type LocalTodo = ServerTodo & {
  pending?: boolean;
};

type QueueCreateAction = {
  id: string;
  type: 'create';
  ts: number;
  tempId: number;
  title: string;
};

type QueueToggleAction = {
  id: string;
  type: 'toggle';
  ts: number;
  todoId: number;
  done: boolean;
};

type QueueDeleteAction = {
  id: string;
  type: 'delete';
  ts: number;
  todoId: number;
};

type QueueAction = QueueCreateAction | QueueToggleAction | QueueDeleteAction;

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const TODOS_STORAGE_KEY = 'lr12.todo.todos';
const QUEUE_STORAGE_KEY = 'lr12.todo.queue';

function toLocalText(value: string) {
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('ru-RU');
}

function nowStamp() {
  return new Date().toISOString();
}

function createTempTodo(title: string): LocalTodo {
  const tempId = -Date.now();
  const stamp = nowStamp();
  return {
    id: tempId,
    title,
    done: false,
    createdAt: stamp,
    updatedAt: stamp,
    pending: true,
  };
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchTodos(): Promise<ServerTodo[]> {
  const response = await fetch(`${API_BASE_URL}/api/todos`);
  const data = await parseJson<{ items: ServerTodo[] }>(response);
  return data.items;
}

async function apiCreate(title: string): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiToggle(todoId: number, done: boolean): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiDelete(todoId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

function registerServiceWorkerStarter() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  void navigator.serviceWorker.register('/sw.js');
}

export default function App() {
  const [todos, setTodos] = useState<LocalTodo[]>(() => readStorage<LocalTodo[]>(TODOS_STORAGE_KEY, []));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [queueActions, setQueueActions] = useState<QueueAction[]>(() =>
    readStorage<QueueAction[]>(QUEUE_STORAGE_KEY, []),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueActions));
  }, [queueActions]);

  const refreshFromServer = useCallback(async () => {
    const serverTodos = await apiFetchTodos();
    setTodos(serverTodos);
  }, []);

  const enqueueAction = useCallback((action: QueueAction) => {
    setQueueActions((current) => [...current, action]);
  }, []);

  const replaceTempTodo = useCallback((tempId: number, nextTodo: ServerTodo) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === tempId ? { ...nextTodo, pending: false } : todo)),
    );
    setQueueActions((current) =>
      current.map((action) => {
        if (action.type === 'toggle' || action.type === 'delete') {
          return action.todoId === tempId ? { ...action, todoId: nextTodo.id } : action;
        }
        return action;
      }),
    );
  }, []);

  const dropQueuedTempCreate = useCallback((tempId: number) => {
    setQueueActions((current) =>
      current.filter((action) => {
        if (action.type === 'create') {
          return action.tempId !== tempId;
        }
        if (action.type === 'toggle' || action.type === 'delete') {
          return action.todoId !== tempId;
        }
        return true;
      }),
    );
  }, []);

  const synchronizeQueue = useCallback(async () => {
    if (isSyncingRef.current || !navigator.onLine) {
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const actions = [...readStorage<QueueAction[]>(QUEUE_STORAGE_KEY, [])];
      const tempIdMap = new Map<number, number>();
      for (const action of actions) {
        if (action.type === 'create') {
          const created = await apiCreate(action.title);
          replaceTempTodo(action.tempId, created);
          tempIdMap.set(action.tempId, created.id);
          setQueueActions((current) => current.filter((item) => item.id !== action.id));
          continue;
        }

        if (action.type === 'toggle') {
          const resolvedId = tempIdMap.get(action.todoId) ?? action.todoId;
          const updated = await apiToggle(resolvedId, action.done);
          setTodos((current) => current.map((todo) => (todo.id === updated.id ? updated : todo)));
          setQueueActions((current) => current.filter((item) => item.id !== action.id));
          continue;
        }

        const resolvedId = tempIdMap.get(action.todoId) ?? action.todoId;
        await apiDelete(resolvedId);
        setQueueActions((current) => current.filter((item) => item.id !== action.id));
      }

      await refreshFromServer();
      setMessage(actions.length > 0 ? 'Офлайн-очередь синхронизирована.' : 'Синхронизация не требовалась.');
    } catch {
      setMessage('Синхронизация прервалась. Очередь сохранена и повторится после reconnect.');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshFromServer, replaceTempTodo]);

  const onCreate = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }

      try {
        const created = await apiCreate(trimmed);
        setTodos((current) => [created, ...current.filter((todo) => todo.id !== created.id)]);
        await refreshFromServer();
        setMessage('Задача добавлена.');
      } catch {
        const tempTodo = createTempTodo(trimmed);
        setTodos((current) => [tempTodo, ...current]);
        enqueueAction({
          id: crypto.randomUUID(),
          type: 'create',
          ts: Date.now(),
          tempId: tempTodo.id,
          title: trimmed,
        });
        setMessage('Сети нет. Задача сохранена локально и будет отправлена позже.');
      }
    },
    [enqueueAction, refreshFromServer],
  );

  const onToggle = useCallback(
    async (todo: LocalTodo) => {
      const nextDone = !todo.done;

      try {
        const updated = await apiToggle(todo.id, nextDone);
        setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        await refreshFromServer();
        setMessage('Статус обновлён.');
      } catch {
        setTodos((current) =>
          current.map((item) =>
            item.id === todo.id ? { ...item, done: nextDone, updatedAt: nowStamp(), pending: true } : item,
          ),
        );
        enqueueAction({
          id: crypto.randomUUID(),
          type: 'toggle',
          ts: Date.now(),
          todoId: todo.id,
          done: nextDone,
        });
        setMessage('Изменение сохранено в офлайн-очередь.');
      }
    },
    [enqueueAction, refreshFromServer],
  );

  const onDelete = useCallback(
    async (todo: LocalTodo) => {
      if (todo.id < 0) {
        setTodos((current) => current.filter((item) => item.id !== todo.id));
        dropQueuedTempCreate(todo.id);
        setMessage('Локальная задача удалена из офлайн-очереди.');
        return;
      }

      try {
        await apiDelete(todo.id);
        setTodos((current) => current.filter((item) => item.id !== todo.id));
        await refreshFromServer();
        setMessage('Задача удалена.');
      } catch {
        setTodos((current) => current.filter((item) => item.id !== todo.id));
        enqueueAction({
          id: crypto.randomUUID(),
          type: 'delete',
          ts: Date.now(),
          todoId: todo.id,
        });
        setMessage('Удаление сохранено в офлайн-очередь.');
      }
    },
    [dropQueuedTempCreate, enqueueAction, refreshFromServer],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = inputValue;
      setInputValue('');
      await onCreate(value);
    },
    [inputValue, onCreate],
  );

  useEffect(() => {
    registerServiceWorkerStarter();

    let cancelled = false;
    const bootstrap = async () => {
      try {
        await refreshFromServer();
      } catch {
        if (!cancelled) {
          setMessage('Backend недоступен. Показываем локальные данные и ждём сеть.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshFromServer]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessage('Сеть восстановлена. Запускаем синхронизацию.');
      void synchronizeQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setMessage('Вы офлайн. Новые действия будут поставлены в очередь.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [synchronizeQueue]);

  const queueSummary = useMemo(
    () => ({
      total: queueActions.length,
      creates: queueActions.filter((action) => action.type === 'create').length,
      updates: queueActions.filter((action) => action.type === 'toggle').length,
      deletes: queueActions.filter((action) => action.type === 'delete').length,
    }),
    [queueActions],
  );

  return (
    <main className="app">
      <header className="header">
        <h1>Todo-сы</h1>
        <span className={`badge ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'online' : 'offline'}</span>
      </header>

      <p className="muted">
        Приложение умеет работать офлайн: действия сохраняются локально и автоматически уезжают на backend после reconnect.
      </p>

      <form className="toolbar" onSubmit={onSubmit}>
        <input
          type="text"
          maxLength={200}
          placeholder="Новая задача"
          required
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Добавить</button>
        <button type="button" disabled={isSyncing || queueActions.length === 0 || !isOnline} onClick={() => void synchronizeQueue()}>
          {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
        </button>
      </form>

      <section className="meta">
        <span className="badge">Офлайн-очередь: {queueSummary.total}</span>
        <span className="badge">create {queueSummary.creates}</span>
        <span className="badge">toggle {queueSummary.updates}</span>
        <span className="badge">delete {queueSummary.deletes}</span>
      </section>

      {message ? <div className="message">{message}</div> : null}
      {isLoading ? <p>Загрузка...</p> : null}
      {!isLoading && todos.length === 0 ? <div className="empty">Пока нет задач</div> : null}

      <ul className="list">
        {todos.map((todo) => (
          <li className="item" key={todo.id}>
            <button type="button" onClick={() => void onToggle(todo)}>
              {todo.done ? '✅' : '⬜'}
            </button>
            <div>
              <div className={todo.done ? 'done' : ''}>
                {todo.title} {todo.pending ? <span className="hint">(pending)</span> : null}
              </div>
              <div className="hint">Сервер · {toLocalText(todo.updatedAt)}</div>
            </div>
            <button type="button" onClick={() => void onDelete(todo)}>
              Удалить
            </button>
            <span className="hint">#{todo.id}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

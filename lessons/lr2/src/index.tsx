import React, { Suspense, useState } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

const createLazyComponent = (importPath: string) => (timestamp: number) =>
  React.lazy(() => import(/* @vite-ignore */ `${importPath}?t=${timestamp}`));

const TASKS = [
  {
    text: "Задание 1-2: Основы",
    createComponent: createLazyComponent("./task1-2_basic"),
  },
  {
    text: "Задание 3-4: Формы и Context",
    createComponent: createLazyComponent("./task3-4_basic"),
  },
  {
    text: "Задание 4: Паттерны",
    createComponent: createLazyComponent("./task4-advanced-patterns"),
  },
];

function TaskErrorFallback({
  error,
  resetErrorBoundary,
  onRetry,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="card">
      <h2>Ошибка в задании</h2>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      <button
        onClick={() => {
          onRetry?.();
          resetErrorBoundary();
        }}
      >
        Повторить
      </button>
    </div>
  );
}

function App() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | undefined>(
    () => {
      const hash = window.location.hash.slice(1);
      const index = Number.parseInt(hash, 10);
      return Number.isInteger(index) && index >= 0 && index < TASKS.length
        ? index
        : 0;
    },
  );
  const [refreshTimestamps, setRefreshTimestamps] = useState<Record<number, number>>({});

  const forceRefresh = (taskIndex: number) => {
    setRefreshTimestamps((prev) => ({ ...prev, [taskIndex]: Date.now() }));
  };

  const handleTaskChange = (index: number) => {
    setCurrentTaskIndex(index);
    window.location.hash = index.toString();
    forceRefresh(index);
  };

  const ActiveTask =
    currentTaskIndex !== undefined
      ? TASKS[currentTaskIndex].createComponent(
          refreshTimestamps[currentTaskIndex] ?? Date.now(),
        )
      : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Лабораторная работа 2: React + TypeScript</h1>
        <nav className="task-nav">
          {TASKS.map((task, index) => (
            <button
              key={task.text}
              className={currentTaskIndex === index ? "active" : ""}
              onClick={() => handleTaskChange(index)}
            >
              {task.text}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <ErrorBoundary
          FallbackComponent={(props) => (
            <TaskErrorFallback
              {...props}
              onRetry={() => {
                if (currentTaskIndex !== undefined) {
                  forceRefresh(currentTaskIndex);
                }
              }}
            />
          )}
          resetKeys={[
            currentTaskIndex,
            currentTaskIndex !== undefined
              ? refreshTimestamps[currentTaskIndex] ?? 0
              : 0,
          ]}
        >
          <Suspense fallback={<div className="card">Загрузка задания...</div>}>
            {ActiveTask ? <ActiveTask /> : <div className="card">Задание не выбрано</div>}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container not found");
}

createRoot(container).render(<App />);

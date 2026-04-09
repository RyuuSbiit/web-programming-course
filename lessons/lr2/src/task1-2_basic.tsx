import React, { useState } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

interface UserCardProps {
  name: string;
  email: string;
  isOnline: boolean;
}

function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{email}</p>
      <span className={isOnline ? "success-message" : "error-message"}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Изучить useState", completed: true },
    { id: 2, text: "Добавить новый todo", completed: false },
  ]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) return;

    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }]);
    setInputValue("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="card">
      <h2>Todo список</h2>
      <div className="flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Новая задача..."
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodo();
          }}
        />
        <Button onClick={addTodo}>Добавить</Button>
      </div>

      <ul className="list mt-1">
        {todos.map((todo) => (
          <li key={todo.id}>
            <div className="flex gap-1 align-center">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  flex: 1,
                }}
              >
                {todo.text}
              </span>
              <button className="danger" onClick={() => deleteTodo(todo.id)}>
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-1">
        Всего: {todos.length} | Завершено:{" "}
        {todos.filter((todo) => todo.completed).length}
      </p>
    </div>
  );
}

export default function TaskBasics() {
  return (
    <div className="app">
      <UserCard
        name="Анна Иванова"
        email="anna@example.com"
        isOnline={true}
      />
      <TodoApp />
    </div>
  );
}

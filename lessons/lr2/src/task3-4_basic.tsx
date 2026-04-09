import React, { createContext, useContext, useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

function SimpleForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="card">
      <h2>Форма обратной связи</h2>
      {submitted && <div className="success-message">Форма отправлена</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Сообщение</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
}

function UserStatus() {
  const { user, logout } = useUser();

  if (!user) {
    return <span>Не авторизован</span>;
  }

  return (
    <div className="flex gap-1 align-center">
      <span>Привет, {user.name}!</span>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}

function Profile() {
  const { user, login } = useUser();

  if (!user) {
    return (
      <div className="card">
        <h2>Вы не авторизованы</h2>
        <button
          onClick={() =>
            login({
              id: 1,
              name: "Иван Иванов",
              email: "ivan@example.com",
            })
          }
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Профиль</h2>
      <p>Имя: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<"form" | "profile">("form");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Формы и Context API</h1>
        <UserStatus />
      </header>
      <nav className="task-nav">
        <button
          className={activeTab === "form" ? "active" : ""}
          onClick={() => setActiveTab("form")}
        >
          Форма
        </button>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
      </nav>
      <div className="app-main">
        {activeTab === "form" ? <SimpleForm /> : <Profile />}
      </div>
    </div>
  );
}

export default function TaskFormsAndContext() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

import { create } from "zustand";
import { orderKeyBetween } from "@/lib/fractionalIndex";
import type { Todo, TodoStatus } from "@/types";

interface TodoStore {
  todos: Todo[];
  loading: boolean;
  fetchTodos: () => Promise<void>;
  createTodo: (data: Partial<Todo> & { title: string }) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  moveTodo: (id: string, status: TodoStatus, beforeId: string | null, afterId: string | null) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  loading: true,

  fetchTodos: async () => {
    set({ loading: true });
    const res = await fetch("/api/todos");
    const todos: Todo[] = await res.json();
    set({ todos, loading: false });
  },

  createTodo: async (data) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const todo: Todo = await res.json();
    set({ todos: [...get().todos, todo] });
  },

  updateTodo: async (id, data) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const todo: Todo = await res.json();
    set({ todos: get().todos.map((t) => (t.id === id ? todo : t)) });
  },

  deleteTodo: async (id) => {
    const prev = get().todos;
    set({ todos: prev.filter((t) => t.id !== id) });
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) set({ todos: prev });
  },

  moveTodo: async (id, status, beforeId, afterId) => {
    const prev = get().todos;
    const before = beforeId ? prev.find((t) => t.id === beforeId)?.order ?? null : null;
    const after = afterId ? prev.find((t) => t.id === afterId)?.order ?? null : null;
    const order = orderKeyBetween(before, after);

    set({
      todos: prev.map((t) => (t.id === id ? { ...t, status, order } : t)),
    });

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, order }),
    });
    if (!res.ok) set({ todos: prev });
  },
}));

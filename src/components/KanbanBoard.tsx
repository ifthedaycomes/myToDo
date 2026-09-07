"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TodoCard } from "@/components/TodoCard";
import { Modal } from "@/components/Modal";
import { TodoForm } from "@/components/TodoForm";
import { useTodoStore } from "@/store/todoStore";
import type { Todo, TodoStatus } from "@/types";

const STATUSES: TodoStatus[] = ["todo", "doing", "done"];

export function KanbanBoard() {
  const { todos, loading, fetchTodos, createTodo, updateTodo, deleteTodo, moveTodo } =
    useTodoStore();
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [modalTodo, setModalTodo] = useState<Todo | null | "new">(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  function columnTodos(status: TodoStatus, excludeId?: string) {
    return todos
      .filter((t) => t.status === status && t.id !== excludeId)
      .sort((a, b) => (a.order < b.order ? -1 : 1));
  }

  function handleDragStart(event: DragStartEvent) {
    const todo = todos.find((t) => t.id === event.active.id) ?? null;
    setActiveTodo(todo);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTodo(null);
    const { active, over } = event;
    if (!over) return;

    const dragged = todos.find((t) => t.id === active.id);
    if (!dragged) return;

    let targetStatus: TodoStatus;
    let targetColumn: Todo[];
    let overIndex: number;

    if (STATUSES.includes(over.id as TodoStatus)) {
      targetStatus = over.id as TodoStatus;
      targetColumn = columnTodos(targetStatus, dragged.id);
      overIndex = targetColumn.length;
    } else {
      const overTodo = todos.find((t) => t.id === over.id);
      if (!overTodo) return;
      targetStatus = overTodo.status;
      targetColumn = columnTodos(targetStatus, dragged.id);
      overIndex = targetColumn.findIndex((t) => t.id === over.id);
      if (overIndex === -1) overIndex = targetColumn.length;
    }

    const beforeId = overIndex > 0 ? targetColumn[overIndex - 1].id : null;
    const afterId = targetColumn[overIndex] ? targetColumn[overIndex].id : null;

    if (
      dragged.status === targetStatus &&
      dragged.id === beforeId &&
      dragged.id === afterId
    ) {
      return;
    }

    moveTodo(dragged.id, targetStatus, beforeId, afterId);
  }

  async function handleSave(data: Partial<Todo> & { title: string }) {
    if (modalTodo && modalTodo !== "new") {
      await updateTodo(modalTodo.id, data);
    } else {
      await createTodo({ ...data, status: "todo" });
    }
    setModalTodo(null);
  }

  async function handleDelete() {
    if (modalTodo && modalTodo !== "new") {
      await deleteTodo(modalTodo.id);
    }
    setModalTodo(null);
  }

  if (loading) {
    return <p className="text-sm text-muted">불러오는 중...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">할 일</h1>
        <button onClick={() => setModalTodo("new")} className="btn-primary">
          + 새 할 일
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              todos={columnTodos(status)}
              onCardClick={(todo) => setModalTodo(todo)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTodo ? <TodoCard todo={activeTodo} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <Modal
        open={modalTodo !== null}
        onClose={() => setModalTodo(null)}
        title={modalTodo === "new" ? "새 할 일" : "할 일 수정"}
      >
        <TodoForm
          todo={modalTodo === "new" ? null : modalTodo}
          onSave={handleSave}
          onDelete={modalTodo !== "new" ? handleDelete : undefined}
        />
      </Modal>
    </div>
  );
}

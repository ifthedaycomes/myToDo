"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TodoCard } from "@/components/TodoCard";
import type { Todo, TodoStatus } from "@/types";

const COLUMN_LABELS: Record<TodoStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export function KanbanColumn({
  status,
  todos,
  onCardClick,
}: {
  status: TodoStatus;
  todos: Todo[];
  onCardClick: (todo: Todo) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{COLUMN_LABELS[status]}</h3>
        <span className="badge bg-primary-soft text-primary">{todos.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[200px] flex-col gap-2 rounded-xl border border-dashed border-border bg-black/[.015] p-2 dark:bg-white/[.02]"
      >
        <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onClick={() => onCardClick(todo)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

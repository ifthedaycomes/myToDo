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
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-medium">{COLUMN_LABELS[status]}</h3>
        <span className="text-xs text-neutral-400">{todos.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className="rounded-lg bg-black/[.02] dark:bg-white/[.03] p-2 min-h-[200px] flex flex-col gap-2"
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

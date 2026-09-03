"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PriorityBadge } from "@/components/PriorityBadge";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Todo } from "@/types";

export function TodoCard({
  todo,
  onClick,
}: {
  todo: Todo;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = todo.status !== "done" && isOverdue(todo.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-2.5 text-sm cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{todo.title}</span>
        <PriorityBadge priority={todo.priority} />
      </div>
      {todo.dueDate && (
        <p className={`text-xs mt-1 ${overdue ? "text-red-500" : "text-neutral-500"}`}>
          마감 {formatDate(todo.dueDate)}
        </p>
      )}
    </div>
  );
}

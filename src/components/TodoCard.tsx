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
      className="card cursor-grab p-3 text-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{todo.title}</span>
        <PriorityBadge priority={todo.priority} />
      </div>
      {todo.dueDate && (
        <p className={`mt-1.5 text-xs ${overdue ? "text-red-500" : "text-muted"}`}>
          마감 {formatDate(todo.dueDate)}
        </p>
      )}
    </div>
  );
}

import type { TodoPriority } from "@/types";

const STYLES: Record<TodoPriority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

const LABELS: Record<TodoPriority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${STYLES[priority]}`}>
      {LABELS[priority]}
    </span>
  );
}

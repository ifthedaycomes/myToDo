import type { TodoPriority } from "@/types";

const STYLES: Record<TodoPriority, string> = {
  high: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

const LABELS: Record<TodoPriority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return <span className={`badge ${STYLES[priority]}`}>{LABELS[priority]}</span>;
}

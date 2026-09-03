export type TodoStatus = "todo" | "doing" | "done";
export type TodoPriority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalWithProgress extends Goal {
  progress: number;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  done: boolean;
  order: number;
  weeklyPlanId: string;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  memo: string | null;
  retrospective: string | null;
  goalId: string | null;
  createdAt: string;
  updatedAt: string;
  weeklyGoals: WeeklyGoal[];
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  dayOfWeek: number | null;
  order: string;
  weeklyPlanId: string | null;
  goalId: string | null;
  createdAt: string;
  updatedAt: string;
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { getWeekStart, formatDate } from "@/lib/utils";
import type { GoalWithProgress, Todo, TodoStatus, WeeklyGoal, WeeklyPlan } from "@/types";

type WeeklyPlanDetail = WeeklyPlan & {
  weeklyGoals: WeeklyGoal[];
  todos: Todo[];
  progress: number;
};

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export function DashboardView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [plan, setPlan] = useState<WeeklyPlanDetail | null>(null);
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const thisWeekStart = getWeekStart(new Date()).toISOString().slice(0, 10);

      const [todosRes, goalsRes, plansRes] = await Promise.all([
        fetch("/api/todos"),
        fetch("/api/goals"),
        fetch("/api/weekly"),
      ]);
      setTodos(await todosRes.json());
      setGoals(await goalsRes.json());
      const plans: WeeklyPlan[] = await plansRes.json();

      const current = plans.find((p) => p.weekStart.slice(0, 10) === thisWeekStart) ?? plans[0] ?? null;

      if (current) {
        const detailRes = await fetch(`/api/weekly/${current.id}`);
        setPlan(await detailRes.json());
        setIsCurrentWeek(current.weekStart.slice(0, 10) === thisWeekStart);
      } else {
        setPlan(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-500">불러오는 중...</p>;
  }

  const statusCounts: Record<TodoStatus, number> = { todo: 0, doing: 0, done: 0 };
  todos.forEach((t) => statusCounts[t.status]++);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">대시보드</h1>

      <section>
        <h2 className="text-sm font-medium mb-2">할 일 현황</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((status) => (
            <div
              key={status}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-center"
            >
              <div className="text-2xl font-semibold">{statusCounts[status]}</div>
              <div className="text-xs text-neutral-500 mt-1">{STATUS_LABELS[status]}</div>
            </div>
          ))}
        </div>
        {todos.length === 0 && (
          <p className="text-sm text-neutral-500 mt-2">
            등록된 할 일이 없습니다.{" "}
            <Link href="/todos" className="underline">
              할 일 추가하기
            </Link>
          </p>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium">
            {plan
              ? isCurrentWeek
                ? "이번 주 계획"
                : `최근 주간 계획 (${formatDate(plan.weekStart)} 주)`
              : "주간 계획"}
          </h2>
          {plan && <span className="text-xs text-neutral-500">{plan.progress}%</span>}
        </div>
        {!plan ? (
          <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-6 text-center">
            <p className="text-sm text-neutral-500 mb-3">아직 주간 계획이 없습니다.</p>
            <Link
              href="/weekly"
              className="inline-block rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm"
            >
              주간 계획 만들기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!isCurrentWeek && (
              <p className="text-xs text-neutral-500">
                이번 주 계획이 아직 없습니다.{" "}
                <Link href="/weekly" className="underline">
                  새로 만들기
                </Link>
              </p>
            )}
            <ProgressBar value={plan.progress} />
            <ul className="flex flex-col gap-1">
              {plan.weeklyGoals.map((g) => (
                <li key={g.id} className="text-sm flex items-center gap-2">
                  <span>{g.done ? "✅" : "⬜️"}</span>
                  <span className={g.done ? "line-through text-neutral-400" : ""}>
                    {g.text}
                  </span>
                </li>
              ))}
              {plan.weeklyGoals.length === 0 && (
                <li className="text-sm text-neutral-500">설정된 목표가 없습니다.</li>
              )}
            </ul>
            <Link
              href={`/weekly/${plan.id}`}
              className="inline-block text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              주간 계획 상세보기 →
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium mb-2">1년 목표</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-neutral-500">
            등록된 목표가 없습니다.{" "}
            <Link href="/goals" className="underline">
              목표 추가하기
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {goals.map((goal) => (
              <li key={goal.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{goal.title}</span>
                  <span className="text-neutral-500">{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

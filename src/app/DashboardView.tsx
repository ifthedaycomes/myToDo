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
    return <p className="text-sm text-muted">불러오는 중...</p>;
  }

  const statusCounts: Record<TodoStatus, number> = { todo: 0, doing: 0, done: 0 };
  todos.forEach((t) => statusCounts[t.status]++);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-semibold tracking-tight">대시보드</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold">할 일 현황</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((status) => (
            <div key={status} className="card p-4 text-center">
              <div className="text-2xl font-semibold text-primary">{statusCounts[status]}</div>
              <div className="mt-1 text-xs text-muted">{STATUS_LABELS[status]}</div>
            </div>
          ))}
        </div>
        {todos.length === 0 && (
          <p className="mt-2 text-sm text-muted">
            등록된 할 일이 없습니다.{" "}
            <Link href="/todos" className="text-primary underline underline-offset-2">
              할 일 추가하기
            </Link>
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {plan
              ? isCurrentWeek
                ? "이번 주 계획"
                : `최근 주간 계획 (${formatDate(plan.weekStart)} 주)`
              : "주간 계획"}
          </h2>
          {plan && <span className="badge bg-primary-soft text-primary">{plan.progress}%</span>}
        </div>
        {!plan ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="mb-3 text-sm text-muted">아직 주간 계획이 없습니다.</p>
            <Link href="/weekly" className="btn-primary inline-flex">
              주간 계획 만들기
            </Link>
          </div>
        ) : (
          <div className="card flex flex-col gap-3 p-4">
            {!isCurrentWeek && (
              <p className="text-xs text-muted">
                이번 주 계획이 아직 없습니다.{" "}
                <Link href="/weekly" className="text-primary underline underline-offset-2">
                  새로 만들기
                </Link>
              </p>
            )}
            <ProgressBar value={plan.progress} />
            <ul className="flex flex-col gap-1">
              {plan.weeklyGoals.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-sm">
                  <span>{g.done ? "✅" : "⬜️"}</span>
                  <span className={g.done ? "text-neutral-400 line-through" : ""}>
                    {g.text}
                  </span>
                </li>
              ))}
              {plan.weeklyGoals.length === 0 && (
                <li className="text-sm text-muted">설정된 목표가 없습니다.</li>
              )}
            </ul>
            <Link href={`/weekly/${plan.id}`} className="link-muted inline-block text-xs">
              주간 계획 상세보기 →
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">1년 목표</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-muted">
            등록된 목표가 없습니다.{" "}
            <Link href="/goals" className="text-primary underline underline-offset-2">
              목표 추가하기
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {goals.map((goal) => (
              <li key={goal.id} className="card p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-muted">{goal.progress}%</span>
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

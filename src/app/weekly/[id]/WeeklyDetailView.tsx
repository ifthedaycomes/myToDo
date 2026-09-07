"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate } from "@/lib/utils";
import type { Todo, WeeklyGoal, WeeklyPlan } from "@/types";

type WeeklyPlanDetail = WeeklyPlan & {
  weeklyGoals: WeeklyGoal[];
  todos: Todo[];
  progress: number;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function WeeklyDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<WeeklyPlanDetail | null>(null);
  const [retrospective, setRetrospective] = useState("");
  const [newTodoDay, setNewTodoDay] = useState<number | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  async function load() {
    const res = await fetch(`/api/weekly/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setPlan(data);
    setRetrospective(data.retrospective ?? "");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleGoal(weeklyGoalId: string, done: boolean) {
    await fetch(`/api/weekly/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyGoalId, done }),
    });
    await load();
  }

  async function saveRetrospective() {
    await fetch(`/api/weekly/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retrospective }),
    });
  }

  async function addTodo(day: number) {
    if (!newTodoTitle.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTodoTitle,
        weeklyPlanId: id,
        dayOfWeek: day,
      }),
    });
    setNewTodoTitle("");
    setNewTodoDay(null);
    await load();
  }

  async function handleDelete() {
    if (!confirm("이 주간 계획을 삭제할까요?")) return;
    await fetch(`/api/weekly/${id}`, { method: "DELETE" });
    router.push("/weekly");
  }

  if (!plan) {
    return <p className="text-sm text-muted">불러오는 중...</p>;
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{formatDate(plan.weekStart)} 주</h1>
        <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">
          삭제
        </button>
      </div>
      <div className="mb-8 flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar value={plan.progress} />
        </div>
        <span className="badge shrink-0 bg-primary-soft text-primary">
          진행률 {plan.progress}%
        </span>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold">이번 주 목표</h2>
        <ul className="flex flex-col gap-1">
          {plan.weeklyGoals.map((g) => (
            <li key={g.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={g.done}
                onChange={(e) => toggleGoal(g.id, e.target.checked)}
                className="accent-[var(--primary)]"
              />
              <span className={g.done ? "text-neutral-400 line-through" : ""}>
                {g.text}
              </span>
            </li>
          ))}
          {plan.weeklyGoals.length === 0 && (
            <li className="text-sm text-muted">설정된 목표가 없습니다.</li>
          )}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold">요일별 할 일</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label, day) => {
            const dayTodos = plan.todos.filter((t) => t.dayOfWeek === day);
            return (
              <div key={day} className="card flex min-h-32 flex-col gap-1 p-2">
                <div className="mb-1 text-xs font-medium text-muted">{label}</div>
                {dayTodos.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-md bg-primary-soft px-2 py-1 text-xs text-primary"
                  >
                    {t.title}
                  </div>
                ))}
                {newTodoDay === day ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addTodo(day);
                    }}
                    className="flex flex-col gap-1"
                  >
                    <input
                      autoFocus
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      onBlur={() => !newTodoTitle && setNewTodoDay(null)}
                      className="rounded-md border border-border bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setNewTodoDay(day)}
                    className="mt-auto text-left text-xs text-neutral-400 hover:text-primary dark:hover:text-primary"
                  >
                    + 할일
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">주간 회고</h2>
        <textarea
          value={retrospective}
          onChange={(e) => setRetrospective(e.target.value)}
          onBlur={saveRetrospective}
          rows={4}
          placeholder="이번 주는 어땠나요?"
          className="field"
        />
      </section>
    </div>
  );
}

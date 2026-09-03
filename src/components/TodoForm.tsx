"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { formatDate } from "@/lib/utils";
import type { Todo, TodoPriority, WeeklyPlan } from "@/types";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

type WeeklyPlanDetail = WeeklyPlan & { todos: Todo[] };

export function TodoForm({
  todo,
  onSave,
  onDelete,
}: {
  todo: Todo | null;
  onSave: (data: Partial<Todo> & { title: string }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [weeklyPlanId, setWeeklyPlanId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");

  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [planDetail, setPlanDetail] = useState<WeeklyPlanDetail | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(todo?.title ?? "");
    setDescription(todo?.description ?? "");
    setPriority(todo?.priority ?? "medium");
    setDueDate(todo?.dueDate ? todo.dueDate.slice(0, 10) : "");
    setWeeklyPlanId(todo?.weeklyPlanId ?? "");
    setDayOfWeek(todo?.dayOfWeek != null ? String(todo.dayOfWeek) : "");
  }, [todo]);

  useEffect(() => {
    fetch("/api/weekly")
      .then((res) => res.json())
      .then(setPlans);
  }, []);

  useEffect(() => {
    if (!weeklyPlanId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlanDetail(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/weekly/${weeklyPlanId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPlanDetail(data);
      });
    return () => {
      cancelled = true;
    };
  }, [weeklyPlanId]);

  function handlePlanChange(id: string) {
    setWeeklyPlanId(id);
    setDayOfWeek("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      weeklyPlanId: weeklyPlanId || null,
      dayOfWeek: dayOfWeek === "" ? null : Number(dayOfWeek),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        autoFocus
        required
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
      />
      <textarea
        placeholder="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          className="flex-1 rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
        >
          <option value="high">높음</option>
          <option value="medium">보통</option>
          <option value="low">낮음</option>
        </select>
        <DatePicker value={dueDate} onChange={setDueDate} className="flex-1" />
      </div>

      <div className="flex gap-2">
        <label className="flex-1 text-sm flex flex-col gap-1">
          연결할 주간 계획 (선택)
          <select
            value={weeklyPlanId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">없음</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {formatDate(plan.weekStart)} 주
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm flex flex-col gap-1">
          요일
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            disabled={!weeklyPlanId}
            className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">지정 안함</option>
            {DAY_LABELS.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {planDetail && (
        <div className="rounded-md border border-black/10 dark:border-white/10 p-2 text-xs text-neutral-500 flex flex-col gap-1">
          <span className="font-medium text-neutral-600 dark:text-neutral-300">
            {formatDate(planDetail.weekStart)} 주에 등록된 항목
          </span>
          {planDetail.weeklyGoals.length === 0 && planDetail.todos.length === 0 ? (
            <span>아직 등록된 목표/할일이 없습니다.</span>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {planDetail.weeklyGoals.map((g) => (
                <li key={g.id} className={g.done ? "line-through" : ""}>
                  🎯 {g.text}
                </li>
              ))}
              {planDetail.todos
                .filter((t) => t.id !== todo?.id)
                .map((t) => (
                  <li key={t.id}>
                    {t.dayOfWeek != null ? `${DAY_LABELS[t.dayOfWeek]} · ` : ""}
                    {t.title}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm"
        >
          저장
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-300 text-red-500 px-3 py-2 text-sm"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}

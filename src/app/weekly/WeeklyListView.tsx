"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate, getWeekStart } from "@/lib/utils";
import type { Goal, WeeklyPlan } from "@/types";

type WeeklyPlanWithProgress = WeeklyPlan & { progress: number };

export function WeeklyListView() {
  const [plans, setPlans] = useState<WeeklyPlanWithProgress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyPlanWithProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState(() =>
    getWeekStart(new Date()).toISOString().slice(0, 10)
  );
  const [memo, setMemo] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goalTexts, setGoalTexts] = useState(["", "", ""]);

  async function load() {
    setLoading(true);
    const [plansRes, goalsRes] = await Promise.all([
      fetch("/api/weekly"),
      fetch("/api/goals"),
    ]);
    setPlans(await plansRes.json());
    setGoals(await goalsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function openCreate() {
    setError(null);
    setEditing(null);
    setWeekStart(getWeekStart(new Date()).toISOString().slice(0, 10));
    setMemo("");
    setGoalId("");
    setGoalTexts(["", "", ""]);
    setModalOpen(true);
  }

  function openEdit(plan: WeeklyPlanWithProgress) {
    setError(null);
    setEditing(plan);
    setWeekStart(plan.weekStart.slice(0, 10));
    setMemo(plan.memo ?? "");
    setGoalId(plan.goalId ?? "");
    const texts = plan.weeklyGoals.map((g) => g.text);
    while (texts.length < 3) texts.push("");
    setGoalTexts(texts);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("이 주간 계획을 삭제할까요?")) return;
    await fetch(`/api/weekly/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(editing ? `/api/weekly/${editing.id}` : "/api/weekly", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart,
        memo,
        goalId: goalId || null,
        goals: goalTexts.filter((t) => t.trim()),
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? (editing ? "수정에 실패했습니다" : "생성에 실패했습니다"));
      return;
    }
    setModalOpen(false);
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">주간 계획</h1>
        <button onClick={openCreate} className="btn-primary">
          + 새 주간 계획
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">불러오는 중...</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-muted">아직 주간 계획이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {plans.map((plan) => (
            <li key={plan.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/weekly/${plan.id}`} className="block min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{formatDate(plan.weekStart)} 주</span>
                    <span className="badge bg-primary-soft text-primary">{plan.progress}%</span>
                  </div>
                  {plan.memo && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{plan.memo}</p>
                  )}
                  <div className="mt-2">
                    <ProgressBar value={plan.progress} />
                  </div>
                </Link>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button onClick={() => openEdit(plan)} className="link-muted">
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "주간 계획 수정" : "새 주간 계획"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <label className="flex flex-col gap-1 text-sm">
            주 시작일
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            연결할 1년 목표 (선택)
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="field"
            >
              <option value="">없음</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-sm">이번 주 목표 (최대 5개)</span>
            {goalTexts.map((text, i) => (
              <input
                key={i}
                placeholder={`목표 ${i + 1}`}
                value={text}
                onChange={(e) => {
                  const next = [...goalTexts];
                  next[i] = e.target.value;
                  setGoalTexts(next);
                }}
                className="field"
              />
            ))}
            {goalTexts.length < 5 && (
              <button
                type="button"
                onClick={() => setGoalTexts([...goalTexts, ""])}
                className="self-start text-xs text-primary"
              >
                + 목표 추가
              </button>
            )}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            메모
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="field"
            />
          </label>
          <button type="submit" className="btn-primary">
            저장
          </button>
        </form>
      </Modal>
    </div>
  );
}

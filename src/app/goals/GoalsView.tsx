"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { ProgressBar } from "@/components/ProgressBar";
import type { GoalWithProgress } from "@/types";

export function GoalsView() {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GoalWithProgress | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/goals");
    setGoals(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setModalOpen(true);
  }

  function openEdit(goal: GoalWithProgress) {
    setEditing(goal);
    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editing) {
      await fetch(`/api/goals/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    } else {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    }
    setModalOpen(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 목표를 삭제할까요?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">1년 목표</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm"
        >
          + 새 목표
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      ) : goals.length === 0 ? (
        <p className="text-sm text-neutral-500">아직 목표가 없습니다. 새 목표를 추가해보세요.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{goal.title}</h3>
                <div className="flex gap-2 text-xs shrink-0">
                  <button
                    onClick={() => openEdit(goal)}
                    className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {goal.description && (
                <p className="text-sm text-neutral-500 mt-1">{goal.description}</p>
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>진행률</span>
                  <span>{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "목표 수정" : "새 목표"}
      >
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
            rows={3}
            className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm"
          >
            저장
          </button>
        </form>
      </Modal>
    </div>
  );
}

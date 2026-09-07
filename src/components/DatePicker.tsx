"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState(() => (selected ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? new Date()).getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function openPopup() {
    const base = selected ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  }

  function pick(day: number) {
    onChange(toDateString(viewYear, viewMonth, day));
    setOpen(false);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPopup())}
        className="field text-left"
      >
        {value || <span className="text-neutral-400">{placeholder}</span>}
      </button>

      {open && (
        <div className="popover absolute z-10 mt-1 w-64 p-3">
          <div className="mb-2 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  if (m === 0) {
                    setViewYear((y) => y - 1);
                    return 11;
                  }
                  return m - 1;
                })
              }
              className="link-muted rounded px-1.5 py-0.5 text-sm"
            >
              ‹
            </button>
            <div className="flex gap-1">
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="rounded-md border border-border bg-transparent px-1 py-0.5 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="rounded-md border border-border bg-transparent px-1 py-0.5 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {m + 1}월
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  if (m === 11) {
                    setViewYear((y) => y + 1);
                    return 0;
                  }
                  return m + 1;
                })
              }
              className="link-muted rounded px-1.5 py-0.5 text-sm"
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-neutral-400">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {cells.map((day, i) => {
              const isSelected =
                day !== null &&
                !!selected &&
                selected.getFullYear() === viewYear &&
                selected.getMonth() === viewMonth &&
                selected.getDate() === day;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={day === null}
                  onClick={() => day !== null && pick(day)}
                  className={`rounded-md py-1 transition-colors ${
                    day === null
                      ? ""
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                  }`}
                >
                  {day ?? ""}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                onChange(toDateString(today.getFullYear(), today.getMonth(), today.getDate()));
                setOpen(false);
              }}
              className="link-muted text-xs"
            >
              오늘
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                지우기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

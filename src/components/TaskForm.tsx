"use client";

import { useState, type FormEvent } from "react";

const QUICK_OPTIONS = [1, 3, 5, 15, 30];

function defaultTimeString(offsetMinutes: number) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function TaskForm({
  onCreate,
  isPending,
  error,
  initialTitle = "",
}: {
  onCreate: (title: string, deadlineAt: string) => void;
  isPending: boolean;
  error: string;
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [customTime, setCustomTime] = useState(() => defaultTimeString(5));
  const [customMinutes, setCustomMinutes] = useState("");
  const [localError, setLocalError] = useState("");

  function submitWithDeadline(deadline: Date) {
    setLocalError("");
    if (!title.trim()) {
      setLocalError("タスク内容を入力してください");
      return;
    }
    onCreate(title, deadline.toISOString());
    setTitle("");
    setCustomTime(defaultTimeString(5));
  }

  function handleQuick(minutes: number) {
    submitWithDeadline(new Date(Date.now() + minutes * 60 * 1000));
  }

  function handleCustomMinutesSubmit(e: FormEvent) {
    e.preventDefault();
    const minutes = Number(customMinutes);
    if (!customMinutes || !Number.isFinite(minutes) || minutes <= 0) {
      setLocalError("分数を入力してください");
      return;
    }
    submitWithDeadline(new Date(Date.now() + minutes * 60 * 1000));
    setCustomMinutes("");
  }

  function handleCustomSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customTime) {
      setLocalError("時刻を指定してください");
      return;
    }
    const [h, m] = customTime.split(":").map(Number);
    const deadline = new Date();
    // 指定した「分」の終わり(59秒)を期限とする。例: 12:04を選ぶと12:04:59まで
    deadline.setSeconds(59, 999);
    deadline.setHours(h, m);
    if (deadline.getTime() <= Date.now()) {
      deadline.setDate(deadline.getDate() + 1);
    }
    submitWithDeadline(deadline);
  }

  const displayError = localError || error;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-5 text-lg font-bold text-[var(--foreground)]">
        次の目標を決める
      </h2>

      <label
        htmlFor="title"
        className="mb-1.5 block text-sm font-medium text-[var(--muted)]"
      >
        何をする?
      </label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例: 歯を磨く"
        className="mb-5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />

      <p className="mb-2 text-sm font-medium text-[var(--muted)]">
        いつまでに?
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={isPending}
            onClick={() => handleQuick(m)}
            className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors active:bg-[var(--accent-dim)] active:border-[var(--accent)] disabled:opacity-50"
          >
            {m}分後
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
          <input
            type="time"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-foreground)] disabled:opacity-50"
          >
            この時刻でセット
          </button>
        </form>

        <form
          onSubmit={handleCustomMinutesSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="分数"
            className="w-20 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-50"
          >
            分後にセット
          </button>
        </form>
      </div>

      {displayError && (
        <p className="mt-3 text-sm text-red-400">{displayError}</p>
      )}
    </div>
  );
}

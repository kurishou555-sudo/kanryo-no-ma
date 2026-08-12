"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  addStockItem,
  deleteStockItem,
  startStockItem,
  updateStockRoutine,
} from "@/app/actions";
import type { StockItem } from "@/lib/types";

const DURATION_OPTIONS = [5, 15, 30, 60];

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 6h12" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6" />
      <path d="M5.5 6l.6 9.4A1.5 1.5 0 0 0 7.6 17h4.8a1.5 1.5 0 0 0 1.5-1.6L14.5 6" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M4 8a5 5 0 0 1 8.5-3.5L14 6" />
      <path d="M14 3v3.5h-3.5" />
      <path d="M16 12a5 5 0 0 1-8.5 3.5L6 14" />
      <path d="M6 17v-3.5h3.5" />
    </svg>
  );
}

export default function StockList({ items }: { items: StockItem[] }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);
  const [isRoutine, setIsRoutine] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await addStockItem(title, duration, isRoutine);
        setTitle("");
        setDuration(5);
        setIsRoutine(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "追加に失敗しました");
      }
    });
  }

  function handleStart(stockId: string) {
    setError("");
    startTransition(async () => {
      try {
        await startStockItem(stockId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "開始に失敗しました");
      }
    });
  }

  function handleDelete(stockId: string) {
    startTransition(async () => {
      await deleteStockItem(stockId);
    });
  }

  function handleToggleRoutine(stockId: string, nextValue: boolean) {
    startTransition(async () => {
      await updateStockRoutine(stockId, nextValue);
    });
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-1.5 text-lg font-bold text-[var(--foreground)]">
        ストック
      </h2>
      <p className="mb-4 text-xs text-[var(--muted)]">
        あとでやりたいことを書き溜めておけます。「開始」を押すと、その場でタイマーが始まります。
      </p>

      <form onSubmit={handleAdd} className="mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: メール返信"
          className="mb-2 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />

        <div className="mb-2 flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                duration === m
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--foreground)]"
              }`}
            >
              {m}分
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={isRoutine}
              onChange={(e) => setIsRoutine(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            毎日のルーティン(開始しても消えません)
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">ストックはまだありません。</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-[var(--foreground)]">
                  {item.title}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span>{item.duration_minutes}分</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleRoutine(item.id, !item.is_routine)
                    }
                    disabled={isPending}
                    aria-pressed={item.is_routine}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 disabled:opacity-50 ${
                      item.is_routine
                        ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                        : "border border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <RepeatIcon />
                    ルーティン
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStart(item.id)}
                  disabled={isPending}
                  className="rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-[var(--accent-foreground)] disabled:opacity-50"
                >
                  開始
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  aria-label="削除"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--muted)] hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

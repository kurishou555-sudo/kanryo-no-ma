"use client";

import { useState, useTransition } from "react";
import { deleteTask, updateTaskNote } from "@/app/actions";
import type { Task } from "@/lib/types";

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

function MemoIcon() {
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
      <path d="M13.5 3.5a1.5 1.5 0 0 1 2.12 2.12L7 14.25 3.5 15l.75-3.5 9.25-8z" />
    </svg>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

type DateGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

function groupTasksByDate(tasks: Task[]): DateGroup[] {
  const groups = new Map<string, DateGroup>();

  for (const task of tasks) {
    const key = dateKey(task.created_at);
    const existing = groups.get(key);
    if (existing) {
      existing.tasks.push(task);
    } else {
      groups.set(key, {
        key,
        label: formatDateLabel(task.created_at),
        tasks: [task],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

export default function TaskHistory({ tasks }: { tasks: Task[] }) {
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">まだタスクがありません。</p>
    );
  }

  const groups = groupTasksByDate(tasks);

  function toggle(key: string) {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      await deleteTask(taskId);
    });
  }

  function handleStartEdit(task: Task) {
    setEditingNoteId(task.id);
    setDraftNote(task.note ?? "");
  }

  function handleCancelEdit() {
    setEditingNoteId(null);
    setDraftNote("");
  }

  function handleSaveNote(taskId: string) {
    startTransition(async () => {
      await updateTaskNote(taskId, draftNote);
      setEditingNoteId(null);
      setDraftNote("");
    });
  }

  return (
    <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
      {groups.map((group) => {
        const isOpen = openDates.has(group.key);
        const completedCount = group.tasks.filter(
          (t) => t.status === "completed"
        ).length;
        const missedCount = group.tasks.filter(
          (t) => t.status === "missed"
        ).length;

        return (
          <div
            key={group.key}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <button
              type="button"
              onClick={() => toggle(group.key)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-[var(--surface-2)]"
            >
              <span className="text-sm font-medium text-[var(--foreground)]">
                {group.label}
                <span className="ml-2 text-xs text-[var(--muted)]">
                  ({completedCount}/{group.tasks.length}件完了
                  {missedCount > 0 && `・${missedCount}件未達成`})
                </span>
              </span>
              <span
                className={`text-[var(--muted)] transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {isOpen && (
              <ul className="space-y-2 border-t border-[var(--border)] px-4 py-3">
                {group.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={
                            task.status === "completed"
                              ? "text-[var(--muted)] line-through"
                              : "font-medium text-[var(--foreground)]"
                          }
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          期限 {formatTime(task.deadline_at)}
                          {task.completed_at &&
                            task.status === "completed" &&
                            ` ・完了 ${formatTime(task.completed_at)}`}
                          {task.completed_at &&
                            task.status === "missed" &&
                            ` ・記録 ${formatTime(task.completed_at)}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-emerald-400/15 text-emerald-400"
                              : task.status === "missed"
                                ? "bg-orange-400/15 text-orange-400"
                                : "bg-[var(--accent-dim)] text-[var(--accent)]"
                          }`}
                        >
                          {task.status === "completed"
                            ? "完了"
                            : task.status === "missed"
                              ? "未達成"
                              : "進行中"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(task)}
                            disabled={isPending}
                            aria-label="メモ"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                          >
                            <MemoIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            disabled={isPending}
                            aria-label="削除"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingNoteId === task.id ? (
                      <div className="mt-2">
                        <textarea
                          value={draftNote}
                          onChange={(e) => setDraftNote(e.target.value)}
                          placeholder="メモを書く"
                          rows={2}
                          autoFocus
                          className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                        />
                        <div className="mt-1.5 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveNote(task.id)}
                            disabled={isPending}
                            className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-bold text-[var(--accent-foreground)] disabled:opacity-50"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs text-[var(--muted)]"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      task.note && (
                        <p
                          className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                            task.status === "missed"
                              ? "bg-orange-400/10 text-orange-300"
                              : "bg-[var(--surface)] text-[var(--muted)]"
                          }`}
                        >
                          {task.note}
                        </p>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

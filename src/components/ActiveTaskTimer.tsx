"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { extendTask } from "@/app/actions";
import type { Task } from "@/lib/types";

const EXTEND_OPTIONS = [5, 15, 30];

function defaultTimeString(offsetMinutes: number) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = h > 0 ? [h, m, s] : [m, s];
  return parts.map((p) => String(p).padStart(2, "0")).join(":");
}

function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
    oscillator.onended = () => ctx.close();
  } catch {
    // 音を鳴らせない環境では無視
  }
}

export default function ActiveTaskTimer({
  task,
  isPending,
  onComplete,
  onCancel,
  onMissed,
}: {
  task: Task;
  isPending: boolean;
  onComplete: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  onMissed: (taskId: string, note: string) => void;
}) {
  const deadline = new Date(task.deadline_at).getTime();
  const [remaining, setRemaining] = useState(() => deadline - Date.now());
  const [isExtending, startExtendTransition] = useTransition();
  const [showMissedForm, setShowMissedForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [customExtendTime, setCustomExtendTime] = useState(() =>
    defaultTimeString(5)
  );
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(deadline - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (remaining <= 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      playBeep();
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("時間になりました", { body: task.title });
      }
    }
  }, [remaining, task.title]);

  function handleExtendQuick(minutes: number) {
    // 「今から」ではなく「今の残り時間(期限)」にN分を足す
    const newDeadline = new Date(deadline + minutes * 60 * 1000);
    startExtendTransition(async () => {
      await extendTask(task.id, newDeadline.toISOString());
    });
  }

  function handleExtendCustomSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customExtendTime) return;
    const [h, m] = customExtendTime.split(":").map(Number);
    const newDeadline = new Date();
    newDeadline.setSeconds(59, 999);
    newDeadline.setHours(h, m);
    if (newDeadline.getTime() <= Date.now()) {
      newDeadline.setDate(newDeadline.getDate() + 1);
    }
    startExtendTransition(async () => {
      await extendTask(task.id, newDeadline.toISOString());
      setCustomExtendTime("");
    });
  }

  const isOverdue = remaining <= 0;
  const busy = isPending || isExtending;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 blur-3xl"
        style={{
          background: isOverdue
            ? "radial-gradient(circle, rgba(248,113,113,0.35), transparent 70%)"
            : "radial-gradient(circle, rgba(255,107,74,0.3), transparent 70%)",
        }}
      />

      <p className="relative mb-1 text-sm font-medium text-[var(--muted)]">
        進行中のタスク
      </p>
      <p className="relative mb-5 text-xl font-bold text-[var(--foreground)]">
        {task.title}
      </p>

      <p
        className={`relative mb-7 font-mono text-5xl font-bold tabular-nums ${
          isOverdue ? "text-red-400" : "text-[var(--accent)]"
        }`}
      >
        {isOverdue ? "時間です" : formatRemaining(remaining)}
      </p>

      <button
        onClick={() => onComplete(task.id)}
        disabled={busy}
        className="relative w-full rounded-xl bg-[var(--accent)] py-4 text-lg font-bold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        完了
      </button>

      <button
        onClick={() => onCancel(task.id)}
        disabled={busy}
        className="relative mt-6 w-full rounded-xl border border-[var(--border-strong)] py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
      >
        取り消す
      </button>

      <div className="relative mt-6 border-t border-[var(--border)] pt-5 text-left">
        {!showExtendForm ? (
          <button
            onClick={() => setShowExtendForm(true)}
            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-center text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]"
          >
            時間を延長する
          </button>
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--muted)]">
              延長する
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {EXTEND_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={busy}
                  onClick={() => handleExtendQuick(m)}
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--foreground)] active:bg-[var(--accent-dim)] active:border-[var(--accent)] disabled:opacity-50"
                >
                  +{m}分
                </button>
              ))}
            </div>
            <form
              onSubmit={handleExtendCustomSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="time"
                value={customExtendTime}
                onChange={(e) => setCustomExtendTime(e.target.value)}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-foreground)] disabled:opacity-50"
              >
                この時刻に変更
              </button>
            </form>
          </div>
        )}
      </div>

      {isOverdue && (
        <div className="relative mt-6 border-t border-[var(--border)] pt-5 text-left">
          {!showMissedForm ? (
            <button
              onClick={() => setShowMissedForm(true)}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-center text-sm font-medium text-[var(--foreground)] hover:border-orange-400"
            >
              できなかった(改善メモを残す)
            </button>
          ) : (
            <div>
              <label
                htmlFor="missed-note"
                className="mb-1 block text-sm font-medium text-[var(--muted)]"
              >
                次はどうする?一言メモ
              </label>
              <textarea
                id="missed-note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="例: 前の予定が押した。次は15分前に予告を入れる。"
                rows={3}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
              <button
                onClick={() => onMissed(task.id, noteText)}
                disabled={busy}
                className="mt-2 w-full rounded-xl border border-[var(--border-strong)] py-2 text-sm font-medium text-[var(--foreground)] active:bg-[var(--surface-2)] disabled:opacity-50"
              >
                記録して次へ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

const EXTEND_OPTIONS = [1, 3, 5, 15, 30];

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
    const now = ctx.currentTime;

    // 「ピピー、ピピー」のようなアラーム音(短い音を4回)
    const beepStarts = [0, 0.18, 0.55, 0.73];
    const beepDuration = 0.15;

    beepStarts.forEach((offset) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 1000;
      gain.gain.setValueAtTime(0.25, now + offset);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + beepDuration);
    });

    const totalMs =
      (beepStarts[beepStarts.length - 1] + beepDuration + 0.1) * 1000;
    setTimeout(() => ctx.close(), totalMs);
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
  const [extendMinutes, setExtendMinutes] = useState(5);
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

  function handleExtendSubmit(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(extendMinutes) || extendMinutes <= 0) return;
    // 「今から」ではなく「今の残り時間(期限)」にN分を足す
    const newDeadline = new Date(deadline + extendMinutes * 60 * 1000);
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

      <p className="relative mb-1.5 text-base font-medium text-[var(--muted)]">
        進行中のタスク
      </p>
      <p className="relative mb-5 text-3xl font-bold text-[var(--foreground)]">
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
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--muted)]">
                延長する
              </p>
              <button
                type="button"
                onClick={() => setShowExtendForm(false)}
                className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
              >
                閉じる
              </button>
            </div>
            <form onSubmit={handleExtendSubmit} className="mb-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {EXTEND_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={busy}
                    onClick={() => setExtendMinutes(m)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                      extendMinutes === m
                        ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                        : "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--foreground)]"
                    }`}
                  >
                    +{m}分
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={extendMinutes}
                    onChange={(e) => setExtendMinutes(Number(e.target.value))}
                    className="w-16 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-2 text-center text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  />
                  分延長
                </span>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-foreground)] disabled:opacity-50"
                >
                  延長する
                </button>
              </div>
            </form>

            <p className="mb-2 text-sm font-medium text-[var(--muted)]">
              または時刻を指定
            </p>
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
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] disabled:opacity-50"
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
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="missed-note"
                  className="text-sm font-medium text-[var(--muted)]"
                >
                  次はどうする?一言メモ
                </label>
                <button
                  type="button"
                  onClick={() => setShowMissedForm(false)}
                  className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
                >
                  閉じる
                </button>
              </div>
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

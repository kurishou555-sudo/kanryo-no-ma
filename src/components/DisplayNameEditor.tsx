"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "@/app/actions";

export default function DisplayNameEditor({
  displayName,
  displayNameSet,
}: {
  displayName: string;
  displayNameSet: boolean;
}) {
  const [editing, setEditing] = useState(!displayNameSet);
  const [value, setValue] = useState(displayNameSet ? displayName : "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateDisplayName(value);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(displayName);
          setEditing(true);
        }}
        className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
      >
        表示名: {displayName || "未設定"} (変更する)
      </button>
    );
  }

  if (!displayNameSet) {
    return (
      <div className="rounded-2xl border border-[var(--accent)] bg-[var(--accent-dim)] p-4">
        <p className="mb-2 text-sm font-bold text-[var(--foreground)]">
          ようこそ!表示名を決めましょう
        </p>
        <p className="mb-3 text-xs text-[var(--muted)]">
          タイムラインなど、他の参加者にはこの名前で表示されます。
        </p>
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例: しょうた"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <button
            onClick={handleSave}
            disabled={isPending || !value.trim()}
            className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-foreground)] disabled:opacity-50"
          >
            決定
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-bold text-[var(--accent-foreground)] disabled:opacity-50"
      >
        保存
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-sm text-[var(--muted)]"
      >
        キャンセル
      </button>
    </div>
  );
}

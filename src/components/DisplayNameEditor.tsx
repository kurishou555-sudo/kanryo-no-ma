"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "@/app/actions";

export default function DisplayNameEditor({
  displayName,
}: {
  displayName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
      >
        表示名: {displayName || "未設定"} (変更する)
      </button>
    );
  }

  function handleSave() {
    startTransition(async () => {
      await updateDisplayName(value);
      setEditing(false);
    });
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

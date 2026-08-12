"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TimelineEntry } from "@/lib/types";

const POLL_INTERVAL_MS = 20000;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimelineFeed({
  initialEntries,
}: {
  initialEntries: TimelineEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*, profiles(display_name)")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(50);
    if (data) setEntries(data as TimelineEntry[]);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div>
      <button
        onClick={refresh}
        disabled={isRefreshing}
        className="mb-4 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] py-2 text-sm font-medium text-[var(--foreground)] active:bg-[var(--surface-2)] disabled:opacity-50"
      >
        {isRefreshing ? "更新中..." : "更新する"}
      </button>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          まだ完了のつぶやきがありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-sm">
                <span className="font-bold text-[var(--foreground)]">
                  {entry.profiles?.display_name ?? "名無しさん"}
                </span>
                <span className="text-[var(--muted)]"> さんが</span>
              </p>
              <p className="my-1 text-base font-medium text-[var(--foreground)]">
                「{entry.title}」を
                <span className="text-[var(--accent)]">完了</span>
                しました
              </p>
              <p className="text-xs text-[var(--muted)]">
                {entry.completed_at && formatDateTime(entry.completed_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

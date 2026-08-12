import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";

type StatsRow = {
  user_id: string;
  display_name: string;
  completed_count: number;
  missed_count: number;
};

type DayRow = {
  user_id: string;
  completed_day: string;
};

type RankingEntry = {
  userId: string;
  name: string;
  streak: number;
  rate: number | null;
};

function RankingCard({
  title,
  unit,
  entries,
}: {
  title: string;
  unit: string;
  entries: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">まだデータがありません。</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-[var(--foreground)]">{entry.name}</span>
              </span>
              <span className="font-bold text-[var(--accent)]">
                {entry.value}
                {unit}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default async function RankingPage() {
  const supabase = await createClient();

  const [{ data: stats }, { data: days }] = await Promise.all([
    supabase.from("user_completion_stats").select("*"),
    supabase.from("user_completion_days").select("*"),
  ]);

  const statsRows = (stats as StatsRow[] | null) ?? [];
  const dayRows = (days as DayRow[] | null) ?? [];

  const daysByUser = new Map<string, string[]>();
  for (const row of dayRows) {
    const list = daysByUser.get(row.user_id) ?? [];
    list.push(row.completed_day);
    daysByUser.set(row.user_id, list);
  }

  const ranking: RankingEntry[] = statsRows
    .filter((row) => row.completed_count + row.missed_count > 0)
    .map((row) => {
      const total = row.completed_count + row.missed_count;
      return {
        userId: row.user_id,
        name: row.display_name,
        streak: computeStreak(daysByUser.get(row.user_id) ?? []),
        rate: total > 0 ? Math.round((row.completed_count / total) * 100) : null,
      };
    });

  const byStreak = [...ranking]
    .sort((a, b) => b.streak - a.streak)
    .map((r) => ({ name: r.name, value: r.streak }));

  const byRate = [...ranking]
    .filter((r) => r.rate !== null)
    .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))
    .map((r) => ({ name: r.name, value: r.rate ?? 0 }));

  const monthLabel = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
  }).format(new Date());

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-[var(--foreground)]">
        {monthLabel}のランキング
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <RankingCard title="継続日数" unit="日" entries={byStreak} />
        <RankingCard title="完了率" unit="%" entries={byRate} />
      </div>
    </main>
  );
}

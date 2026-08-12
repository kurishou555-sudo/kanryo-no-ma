export function todayInTokyo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(
    new Date()
  );
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// 完了日(YYYY-MM-DD)のリストから、今日または昨日を起点にした連続日数を数える
export function computeStreak(days: string[]): number {
  const daySet = new Set(days);
  let cursor = todayInTokyo();

  if (!daySet.has(cursor)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (daySet.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

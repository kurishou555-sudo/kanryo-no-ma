export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-32 rounded-lg bg-[var(--surface-2)]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-3xl bg-[var(--surface)]" />
          <div className="space-y-6">
            <div className="h-40 rounded-3xl bg-[var(--surface)]" />
            <div className="h-40 rounded-3xl bg-[var(--surface)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

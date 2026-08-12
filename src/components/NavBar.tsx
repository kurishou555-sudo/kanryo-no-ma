import Link from "next/link";
import { logout } from "@/app/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur">
      <span className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
        完了<span className="text-[var(--accent)]">の間</span>
      </span>
      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          ホーム
        </Link>
        <Link href="/timeline" className="hover:text-[var(--foreground)]">
          タイムライン
        </Link>
        <Link href="/ranking" className="hover:text-[var(--foreground)]">
          ランキング
        </Link>
        <ThemeToggle />
        <form action={logout} className="ml-1 border-l border-[var(--border)] pl-4">
          <button
            type="submit"
            className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--muted)] hover:border-red-400 hover:text-red-400"
          >
            ログアウト
          </button>
        </form>
      </div>
    </nav>
  );
}

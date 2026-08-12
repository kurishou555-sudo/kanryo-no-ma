import Link from "next/link";
import { logout } from "@/app/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur">
      <span className="font-bold tracking-tight text-[var(--foreground)]">
        完了<span className="text-[var(--accent)]">の間</span>
      </span>
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          マイページ
        </Link>
        <Link href="/timeline" className="hover:text-[var(--foreground)]">
          タイムライン
        </Link>
        <ThemeToggle />
        <form action={logout}>
          <button type="submit" className="hover:text-[var(--foreground)]">
            ログアウト
          </button>
        </form>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions";
import ThemeToggle from "@/components/ThemeToggle";

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="h-4 w-4"
      >
        <path d="M5 5l10 10M15 5L5 15" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          完了<span className="text-[var(--accent)]">の間</span>
        </span>

        <div className="hidden items-center gap-4 text-sm text-[var(--muted)] sm:flex">
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
          <form
            action={logout}
            className="ml-1 border-l border-[var(--border)] pl-4"
          >
            <button
              type="submit"
              className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--muted)] hover:border-red-400 hover:text-red-400"
            >
              ログアウト
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="メニュー"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--foreground)] sm:hidden"
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              ホーム
            </Link>
            <Link
              href="/timeline"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              タイムライン
            </Link>
            <Link
              href="/ranking"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              ランキング
            </Link>

            <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-3 px-3">
              <span className="text-xs text-[var(--muted)]">テーマ</span>
              <ThemeToggle />
            </div>

            <form action={logout} className="mt-1">
              <button
                type="submit"
                className="w-full rounded-lg border border-[var(--border-strong)] py-2.5 text-sm text-[var(--muted)] hover:border-red-400 hover:text-red-400"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

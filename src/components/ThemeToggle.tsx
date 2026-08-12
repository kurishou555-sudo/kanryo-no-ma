"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("kanryo-theme", next);
    } catch {
      // localStorageが使えない環境では無視
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="ライト/ダーク切り替え"
      className="rounded-full border border-[var(--border-strong)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
    >
      {theme === "dark" ? "ライト" : "ダーク"}
    </button>
  );
}

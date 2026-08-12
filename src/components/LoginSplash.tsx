"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 2800;

export default function LoginSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alreadyShown = true;
    try {
      alreadyShown = sessionStorage.getItem("kanryo-welcomed") === "1";
    } catch {
      // sessionStorageが使えない環境では毎回スキップ(表示しない)
    }

    if (alreadyShown) return;

    setVisible(true);
    try {
      sessionStorage.setItem("kanryo-welcomed", "1");
    } catch {
      // 保存できなくても表示だけは行う
    }

    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="splash-overlay pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]"
      style={{ animation: `splash-overlay ${DURATION_MS}ms ease-in-out forwards` }}
    >
      <p
        className="splash-text px-8 text-center text-4xl font-bold leading-relaxed text-[var(--foreground)] sm:text-5xl"
        style={{ animation: `splash-text ${DURATION_MS}ms ease-in-out forwards` }}
      >
        決めて、<span className="text-[var(--accent)]">やる。</span>
        <br />
        を習慣にする。
      </p>
    </div>
  );
}

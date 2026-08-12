"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-[var(--foreground)]">
          完了<span className="text-[var(--accent)]">の間</span>
        </h1>
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          決めて、やる。を習慣にする。
        </p>

        {status === "sent" ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center text-sm">
            <p className="font-medium text-[var(--foreground)]">
              メールを送信しました
            </p>
            <p className="mt-1 text-[var(--muted)]">
              {email}{" "}
              宛にログイン用リンクを送りました。メール内のリンクをタップしてログインしてください。
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[var(--muted)]"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-[var(--accent)] py-3 font-bold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {status === "sending" ? "送信中..." : "ログインリンクを送る"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

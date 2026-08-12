import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import TaskSection from "@/components/TaskSection";
import TaskHistory from "@/components/TaskHistory";
import StockList from "@/components/StockList";
import DisplayNameEditor from "@/components/DisplayNameEditor";
import type { Task, Profile, StockItem } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const [{ data: profile }, { data: activeTask }, { data: history }, { data: stock }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("task_stock")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

  const typedProfile = profile as Profile | null;

  return (
    <div className="min-h-screen pb-24">
      <NavBar />
      <main className="mx-auto max-w-lg px-4 py-6">
        <DisplayNameEditor
          displayName={typedProfile?.display_name ?? ""}
          displayNameSet={typedProfile?.display_name_set ?? false}
        />

        <section className="mt-6">
          <TaskSection initialActiveTask={(activeTask as Task | null) ?? null} />
        </section>

        <section className="mt-6">
          <StockList items={(stock as StockItem[]) ?? []} />
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-[var(--muted)]">
            自分のタスク履歴
          </h2>
          <TaskHistory tasks={(history as Task[]) ?? []} />
        </section>
      </main>
    </div>
  );
}

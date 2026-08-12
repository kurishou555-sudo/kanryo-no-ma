import { createClient } from "@/lib/supabase/server";
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
  const user = session!.user;

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
    <main className="mx-auto max-w-5xl px-4 py-6">
      <DisplayNameEditor
        displayName={typedProfile?.display_name ?? ""}
        displayNameSet={typedProfile?.display_name_set ?? false}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section>
          <TaskSection
            initialActiveTask={(activeTask as Task | null) ?? null}
          />
        </section>

        <div className="space-y-6">
          <section>
            <StockList items={(stock as StockItem[]) ?? []} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-[var(--muted)]">
              自分のタスク履歴
            </h2>
            <TaskHistory tasks={(history as Task[]) ?? []} />
          </section>
        </div>
      </div>
    </main>
  );
}

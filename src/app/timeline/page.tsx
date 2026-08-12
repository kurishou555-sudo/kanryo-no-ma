import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import TimelineFeed from "@/components/TimelineFeed";
import type { TimelineEntry } from "@/lib/types";

export default async function TimelinePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const { data } = await supabase
    .from("tasks")
    .select("*, profiles(display_name)")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen pb-24">
      <NavBar />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="mb-4 text-lg font-bold text-[var(--foreground)]">
          タイムライン
        </h1>
        <TimelineFeed initialEntries={(data as TimelineEntry[]) ?? []} />
      </main>
    </div>
  );
}

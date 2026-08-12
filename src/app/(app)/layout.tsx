import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import LoginSplash from "@/components/LoginSplash";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen pb-24">
      <LoginSplash />
      <NavBar />
      {children}
    </div>
  );
}

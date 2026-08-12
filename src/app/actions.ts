"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(title: string, deadlineAt: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const trimmed = title.trim();
  if (!trimmed) throw new Error("タスク内容を入力してください");

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title: trimmed,
    deadline_at: deadlineAt,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("すでに進行中のタスクがあります");
    }
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/timeline");
}

export async function markTaskMissed(taskId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "missed",
      completed_at: new Date().toISOString(),
      note: note.trim() || null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function cancelTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function updateTaskNote(taskId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .update({ note: note.trim() || null })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/timeline");
}

export async function extendTask(taskId: string, newDeadlineAt: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("tasks")
    .update({ deadline_at: newDeadlineAt })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function updateDisplayName(displayName: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("ログインが必要です");

  const trimmed = displayName.trim();
  if (!trimmed) throw new Error("表示名を入力してください");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/timeline");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

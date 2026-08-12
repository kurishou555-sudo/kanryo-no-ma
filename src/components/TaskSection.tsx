"use client";

import { useOptimistic, useState, useTransition } from "react";
import TaskForm from "./TaskForm";
import ActiveTaskTimer from "./ActiveTaskTimer";
import { createTask, completeTask, cancelTask, markTaskMissed } from "@/app/actions";
import type { Task } from "@/lib/types";

export default function TaskSection({
  initialActiveTask,
}: {
  initialActiveTask: Task | null;
}) {
  const [optimisticTask, setOptimisticTask] = useOptimistic(initialActiveTask);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate(title: string, deadlineAt: string) {
    setError("");
    startTransition(async () => {
      setOptimisticTask({
        id: `optimistic-${Date.now()}`,
        user_id: "",
        title,
        deadline_at: deadlineAt,
        status: "active",
        created_at: new Date().toISOString(),
        completed_at: null,
        note: null,
      });
      try {
        await createTask(title, deadlineAt);
      } catch (e) {
        setError(e instanceof Error ? e.message : "作成に失敗しました");
      }
    });
  }

  function handleComplete(taskId: string) {
    startTransition(async () => {
      setOptimisticTask(null);
      await completeTask(taskId);
    });
  }

  function handleCancel(taskId: string) {
    startTransition(async () => {
      setOptimisticTask(null);
      await cancelTask(taskId);
    });
  }

  function handleMissed(taskId: string, note: string) {
    startTransition(async () => {
      setOptimisticTask(null);
      await markTaskMissed(taskId, note);
    });
  }

  return optimisticTask ? (
    <ActiveTaskTimer
      task={optimisticTask}
      isPending={isPending}
      onComplete={handleComplete}
      onCancel={handleCancel}
      onMissed={handleMissed}
    />
  ) : (
    <TaskForm onCreate={handleCreate} isPending={isPending} error={error} />
  );
}

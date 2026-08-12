export type TaskStatus = "active" | "completed" | "missed";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  deadline_at: string;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
  note: string | null;
};

export type Profile = {
  id: string;
  display_name: string;
  display_name_set: boolean;
  created_at: string;
};

export type TimelineEntry = Task & {
  profiles: Pick<Profile, "display_name"> | null;
};

export type StockItem = {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  is_routine: boolean;
  created_at: string;
};

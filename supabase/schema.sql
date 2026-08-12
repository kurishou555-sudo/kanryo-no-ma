-- 完了の間 データベーススキーマ
-- Supabaseの SQL Editor でこのファイルの内容をそのまま実行してください。

-- プロフィール(表示名)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '名無しさん',
  display_name_set boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name_set boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 新規ユーザー登録時にプロフィールを自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), '名無しさん'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- タスク(目標・完了つぶやき)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  deadline_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 同時に進行中タスクは1人につき1件まで
create unique index if not exists tasks_one_active_per_user
  on public.tasks (user_id)
  where status = 'active';

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_completed_at_idx
  on public.tasks (completed_at desc)
  where status = 'completed';

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_select_completed_all" on public.tasks;
create policy "tasks_select_completed_all" on public.tasks
  for select using (status = 'completed');

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);

-- 自分のタスクは削除もできるようにする(取り消し・履歴からの削除で必要)
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- 期限内に完了できなかった場合の振り返りメモ
alter table public.tasks
  add column if not exists note text;

alter table public.tasks
  drop constraint if exists tasks_status_check;
alter table public.tasks
  add constraint tasks_status_check check (status in ('active', 'completed', 'missed'));

-- タスクのストック(事前にやりたいことをメモしておく置き場)
create table if not exists public.task_stock (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  duration_minutes integer not null default 5,
  is_routine boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.task_stock
  add column if not exists duration_minutes integer not null default 5;
alter table public.task_stock
  add column if not exists is_routine boolean not null default false;

create index if not exists task_stock_user_id_idx on public.task_stock (user_id);

alter table public.task_stock enable row level security;

drop policy if exists "task_stock_select_own" on public.task_stock;
create policy "task_stock_select_own" on public.task_stock
  for select using (auth.uid() = user_id);

drop policy if exists "task_stock_insert_own" on public.task_stock;
create policy "task_stock_insert_own" on public.task_stock
  for insert with check (auth.uid() = user_id);

drop policy if exists "task_stock_delete_own" on public.task_stock;
create policy "task_stock_delete_own" on public.task_stock
  for delete using (auth.uid() = user_id);

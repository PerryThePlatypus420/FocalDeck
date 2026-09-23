-- Lets PostgREST embed `profiles` when querying project_members (assignee
-- pickers, project member lists) and tasks (showing the assignee's
-- name/email on task cards) -- same reasoning as the workspace_members FK
-- added in 20260922010000_add_profiles.sql.
alter table public.project_members
  add constraint project_members_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.tasks
  add constraint tasks_assignee_id_profiles_fkey
  foreign key (assignee_id) references public.profiles (id) on delete set null;

-- Manual archive (not auto-archive/time-based -- see WORKFLOW.md discussion):
-- a task moved to "Done" doesn't get deleted, it can be archived from the
-- board so it stops accumulating there, but stays retrievable.
alter table public.tasks add column archived_at timestamptz;

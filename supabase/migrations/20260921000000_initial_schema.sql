-- FocalDeck initial schema
-- Implements the hierarchy and permission matrix defined in WORKFLOW.md:
-- Workspace (Owner/Manager/Admin/Member) -> Project (Lead/Contributor) -> Task
--
-- Project visibility (WORKFLOW.md v1.2): Jira-style, not public/private.
-- There is no workspace-wide "browse all projects" default for regular
-- members -- a project is invisible to everyone except its explicit
-- project_members, full stop. Owner/Manager/Admin are the exception: those
-- workspace roles can always see and administer every project in their
-- workspace (needed for oversight, deleting/reassigning projects, and
-- workspace-wide analytics), the same way a Jira site/project admin can
-- browse projects they haven't been individually added to.
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================================
-- 1. Extensions
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Enums
-- ============================================================================
create type public.workspace_role as enum ('owner', 'manager', 'admin', 'member');
create type public.project_role as enum ('lead', 'contributor');
create type public.task_priority as enum ('critical', 'high', 'medium', 'low');

-- ============================================================================
-- 3. Tables
-- ============================================================================

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  description text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text,
  role public.workspace_role not null default 'member',
  -- Set together: inviting straight into a project (a Lead invites someone
  -- to their project without going through a workspace Owner/Admin). If
  -- null, this is a plain workspace-level invite.
  project_id uuid references public.projects (id) on delete cascade,
  project_role public.project_role,
  token uuid not null default gen_random_uuid(),
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id),
  constraint workspace_invites_role_not_owner check (role <> 'owner'),
  constraint workspace_invites_project_role_pairing check (
    (project_id is null and project_role is null)
    or (project_id is not null and project_role is not null)
  ),
  -- A project invite can only grant base 'member' access, never an
  -- escalated workspace role -- admin/manager can only be granted at the
  -- workspace level.
  constraint workspace_invites_project_role_scope check (
    project_id is null or role = 'member'
  )
);

create unique index workspace_invites_token_idx on public.workspace_invites (token);
create index workspace_invites_project_id_idx on public.workspace_invites (project_id);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.project_role not null default 'contributor',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.project_columns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  position integer not null,
  created_at timestamptz not null default now(),
  unique (project_id, position)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  column_id uuid not null references public.project_columns (id) on delete restrict,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  priority public.task_priority not null default 'medium',
  due_date date,
  assignee_id uuid references auth.users (id) on delete set null,
  created_by uuid not null references auth.users (id),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 4. Indexes
-- ============================================================================
create index workspace_members_user_id_idx on public.workspace_members (user_id);
create index workspace_invites_workspace_id_idx on public.workspace_invites (workspace_id);
create index projects_workspace_id_idx on public.projects (workspace_id);
create index project_members_user_id_idx on public.project_members (user_id);
create index project_columns_project_id_idx on public.project_columns (project_id);
create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_column_id_idx on public.tasks (column_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

-- ============================================================================
-- 5. Helper functions (security definer, used inside RLS policies)
-- ============================================================================

create or replace function public.get_workspace_role(p_workspace_id uuid, p_user_id uuid)
returns public.workspace_role
language sql security definer stable set search_path = public as $$
  select role from public.workspace_members
  where workspace_id = p_workspace_id and user_id = p_user_id;
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_user_id
  );
$$;

create or replace function public.get_project_role(p_project_id uuid, p_user_id uuid)
returns public.project_role
language sql security definer stable set search_path = public as $$
  select role from public.project_members
  where project_id = p_project_id and user_id = p_user_id;
$$;

create or replace function public.is_project_member(p_project_id uuid, p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = p_user_id
  );
$$;

-- True if the user can see the project at all. There is no "public project"
-- concept: browse access is per-project, like Jira. A regular workspace
-- Member sees ONLY projects they're an explicit project_member of, even
-- other projects in the same workspace they aren't on stay invisible.
-- Owner/Manager/Admin are the one exception, retaining full visibility
-- across every project in their workspace for oversight/administration.
create or replace function public.can_view_project(p_project_id uuid, p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = p_user_id
  )
  or exists (
    select 1
    from public.projects pr
    where pr.id = p_project_id
      and public.get_workspace_role(pr.workspace_id, p_user_id) in ('owner', 'manager', 'admin')
  );
$$;

-- ============================================================================
-- 6. Triggers
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

-- Workspace creator automatically becomes its Owner.
create or replace function public.handle_new_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_workspace_created
after insert on public.workspaces
for each row execute function public.handle_new_workspace();

-- Project creator automatically becomes its Lead; default Kanban columns are seeded.
create or replace function public.handle_new_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.created_by, 'lead');

  insert into public.project_columns (project_id, name, position) values
    (new.id, 'To Do', 0),
    (new.id, 'In Progress', 1),
    (new.id, 'Review', 2),
    (new.id, 'Done', 3);

  return new;
end;
$$;

create trigger on_project_created
after insert on public.projects
for each row execute function public.handle_new_project();

-- Deleting a project cascades to both `tasks` and `project_columns`, but
-- `tasks.column_id` REFERENCES `project_columns` ON DELETE RESTRICT (so a
-- direct "delete this single column" action can't silently orphan/destroy
-- tasks). Postgres doesn't guarantee the tasks cascade runs before the
-- project_columns cascade when both fire from the same parent delete, which
-- would make that RESTRICT spuriously block deleting a whole project. This
-- forces the order: tasks are gone before the standard cascades even start.
create or replace function public.cleanup_project_tasks()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.tasks where project_id = OLD.id;
  return OLD;
end;
$$;

create trigger projects_cleanup_tasks_before_delete
before delete on public.projects
for each row execute function public.cleanup_project_tasks();

-- Enforces WORKFLOW.md's owner-succession rule: a workspace can never be left
-- without at least one Owner (blocks removing/demoting the last Owner).
create or replace function public.enforce_owner_succession()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  remaining_owners integer;
begin
  if TG_OP = 'DELETE' then
    if OLD.role = 'owner' then
      -- If the workspace itself is being deleted, this DELETE is just the
      -- ON DELETE CASCADE from workspaces -- there's no workspace left to
      -- require an owner for, so let it through. By the time a cascaded
      -- child delete fires, the parent row is already gone.
      if not exists (select 1 from public.workspaces where id = OLD.workspace_id) then
        return OLD;
      end if;

      select count(*) into remaining_owners
      from public.workspace_members
      where workspace_id = OLD.workspace_id and role = 'owner' and user_id <> OLD.user_id;
      if remaining_owners = 0 then
        raise exception 'Cannot remove the last owner of a workspace. Assign a new owner first.';
      end if;
    end if;
    return OLD;
  end if;

  if TG_OP = 'UPDATE' then
    if OLD.role = 'owner' and NEW.role <> 'owner' then
      select count(*) into remaining_owners
      from public.workspace_members
      where workspace_id = OLD.workspace_id and role = 'owner' and user_id <> OLD.user_id;
      if remaining_owners = 0 then
        raise exception 'Cannot change the role of the last owner. Assign a new owner first.';
      end if;
    end if;
    return NEW;
  end if;

  return null;
end;
$$;

create trigger workspace_members_owner_succession
before update or delete on public.workspace_members
for each row execute function public.enforce_owner_succession();

-- Guards task integrity: assignee must be a project member, column must
-- belong to the same project as the task.
create or replace function public.validate_task_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is not null and not exists (
    select 1 from public.project_members
    where project_id = new.project_id and user_id = new.assignee_id
  ) then
    raise exception 'Assignee must be a member of the project';
  end if;

  if not exists (
    select 1 from public.project_columns
    where id = new.column_id and project_id = new.project_id
  ) then
    raise exception 'Column does not belong to this project';
  end if;

  return new;
end;
$$;

create trigger tasks_validate_before_write
before insert or update on public.tasks
for each row execute function public.validate_task_write();

-- Guards invite integrity: a project-scoped invite's project must actually
-- belong to the invite's workspace.
create or replace function public.validate_workspace_invite()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects
    where id = new.project_id and workspace_id = new.workspace_id
  ) then
    raise exception 'Project does not belong to this workspace';
  end if;

  return new;
end;
$$;

create trigger workspace_invites_validate_before_write
before insert or update on public.workspace_invites
for each row execute function public.validate_workspace_invite();

-- ============================================================================
-- 7. RPCs for flows that cross normal RLS boundaries
-- ============================================================================

-- Accept a workspace invite by token (invitee is not yet a workspace member,
-- so this must run with elevated privileges). Handles both plain workspace
-- invites and project-scoped invites (which also grant project membership).
-- An existing member's workspace role is never downgraded by an invite --
-- e.g. accepting a project invite while already an Admin keeps you Admin.
create or replace function public.accept_workspace_invite(p_token uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.workspace_invites;
  v_workspace_role public.workspace_role;
  v_project_role public.project_role;
begin
  select * into v_invite
  from public.workspace_invites
  where token = p_token and accepted_at is null and expires_at > now()
  for update;

  if v_invite is null then
    raise exception 'Invite is invalid, expired, or already used';
  end if;

  if v_invite.email is not null and lower(v_invite.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'This invite was issued for a different email address';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, auth.uid(), v_invite.role)
  on conflict (workspace_id, user_id) do nothing;

  select role into v_workspace_role
  from public.workspace_members
  where workspace_id = v_invite.workspace_id and user_id = auth.uid();

  if v_invite.project_id is not null then
    insert into public.project_members (project_id, user_id, role)
    values (v_invite.project_id, auth.uid(), v_invite.project_role)
    on conflict (project_id, user_id) do update set role = excluded.role
    returning role into v_project_role;
  end if;

  update public.workspace_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  return jsonb_build_object(
    'workspace_id', v_invite.workspace_id,
    'workspace_role', v_workspace_role,
    'project_id', v_invite.project_id,
    'project_role', v_project_role
  );
end;
$$;

grant execute on function public.accept_workspace_invite(uuid) to authenticated;

-- Only the current Owner may transfer ownership; this is a single-purpose
-- RPC rather than a generic role-update policy so "only Owners assign Owners"
-- (WORKFLOW.md) can't be bypassed via a plain UPDATE.
create or replace function public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.get_workspace_role(p_workspace_id, auth.uid()) <> 'owner' then
    raise exception 'Only the current owner can transfer ownership';
  end if;

  if not public.is_workspace_member(p_workspace_id, p_new_owner_id) then
    raise exception 'New owner must already be a workspace member';
  end if;

  update public.workspace_members
  set role = 'owner'
  where workspace_id = p_workspace_id and user_id = p_new_owner_id;

  update public.workspace_members
  set role = 'admin'
  where workspace_id = p_workspace_id and user_id = auth.uid();
end;
$$;

grant execute on function public.transfer_workspace_ownership(uuid, uuid) to authenticated;

-- ============================================================================
-- 8. Row Level Security
-- ============================================================================
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_columns enable row level security;
alter table public.tasks enable row level security;

-- workspaces --------------------------------------------------------------

-- `or created_by = auth.uid()` matters, not just belt-and-suspenders: a
-- RETURNING clause (as in `.insert(...).select()`) is checked against this
-- SELECT policy using the row's state *before* the on_workspace_created
-- trigger's side effect (adding the creator to workspace_members) becomes
-- visible to it, so relying on is_workspace_member() alone here makes the
-- very first insert-and-return-the-new-row call fail RLS.
create policy workspaces_select on public.workspaces
for select using (public.is_workspace_member(id, auth.uid()) or created_by = auth.uid());

create policy workspaces_insert on public.workspaces
for insert with check (created_by = auth.uid());

create policy workspaces_update on public.workspaces
for update using (public.get_workspace_role(id, auth.uid()) in ('owner', 'manager', 'admin'));

create policy workspaces_delete on public.workspaces
for delete using (public.get_workspace_role(id, auth.uid()) = 'owner');

-- workspace_members ---------------------------------------------------------

create policy workspace_members_select on public.workspace_members
for select using (public.is_workspace_member(workspace_id, auth.uid()));

create policy workspace_members_insert on public.workspace_members
for insert with check (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  and role <> 'owner'
);

create policy workspace_members_update on public.workspace_members
for update using (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
)
with check (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  and role <> 'owner'
);

create policy workspace_members_delete on public.workspace_members
for delete using (
  user_id = auth.uid()
  or public.get_workspace_role(workspace_id, auth.uid()) = 'owner'
  or (public.get_workspace_role(workspace_id, auth.uid()) in ('manager', 'admin') and role <> 'owner')
);

-- workspace_invites ----------------------------------------------------------

create policy workspace_invites_select on public.workspace_invites
for select using (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  or (project_id is not null and public.get_project_role(project_id, auth.uid()) = 'lead')
);

-- A workspace Owner/Manager/Admin can send any workspace-level invite.
-- A project Lead can additionally invite people straight into their own
-- project without needing broader workspace permissions.
create policy workspace_invites_insert on public.workspace_invites
for insert with check (
  invited_by = auth.uid()
  and (
    public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
    or (project_id is not null and public.get_project_role(project_id, auth.uid()) = 'lead')
  )
);

create policy workspace_invites_delete on public.workspace_invites
for delete using (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  or (project_id is not null and public.get_project_role(project_id, auth.uid()) = 'lead')
);

-- projects --------------------------------------------------------------

-- Same RETURNING-vs-trigger-timing reasoning as workspaces_select above:
-- the on_project_created trigger's project_members insert isn't visible to
-- this check yet when `.insert(...).select()` evaluates it.
create policy projects_select on public.projects
for select using (public.can_view_project(id, auth.uid()) or created_by = auth.uid());

create policy projects_insert on public.projects
for insert with check (
  public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  and created_by = auth.uid()
);

create policy projects_update on public.projects
for update using (
  public.get_project_role(id, auth.uid()) = 'lead'
  or public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
);

create policy projects_delete on public.projects
for delete using (
  public.get_project_role(id, auth.uid()) = 'lead'
  or public.get_workspace_role(workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
);

-- project_members ---------------------------------------------------------

create policy project_members_select on public.project_members
for select using (
  public.is_project_member(project_id, auth.uid())
  or exists (
    select 1 from public.projects pr
    where pr.id = project_id
      and public.get_workspace_role(pr.workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
  )
);

create policy project_members_insert on public.project_members
for insert with check (
  exists (
    select 1 from public.projects pr
    where pr.id = project_id
      and (
        public.get_project_role(project_id, auth.uid()) = 'lead'
        or public.get_workspace_role(pr.workspace_id, auth.uid()) in ('owner', 'manager', 'admin')
      )
      and public.is_workspace_member(pr.workspace_id, user_id)
  )
);

create policy project_members_update on public.project_members
for update using (public.get_project_role(project_id, auth.uid()) = 'lead');

create policy project_members_delete on public.project_members
for delete using (
  user_id = auth.uid()
  or public.get_project_role(project_id, auth.uid()) = 'lead'
);

-- project_columns ---------------------------------------------------------

create policy project_columns_select on public.project_columns
for select using (public.can_view_project(project_id, auth.uid()));

create policy project_columns_insert on public.project_columns
for insert with check (public.get_project_role(project_id, auth.uid()) = 'lead');

create policy project_columns_update on public.project_columns
for update using (public.get_project_role(project_id, auth.uid()) = 'lead');

create policy project_columns_delete on public.project_columns
for delete using (public.get_project_role(project_id, auth.uid()) = 'lead');

-- tasks --------------------------------------------------------------

create policy tasks_select on public.tasks
for select using (public.can_view_project(project_id, auth.uid()));

create policy tasks_insert on public.tasks
for insert with check (public.is_project_member(project_id, auth.uid()));

create policy tasks_update on public.tasks
for update using (public.is_project_member(project_id, auth.uid()));

create policy tasks_delete on public.tasks
for delete using (public.is_project_member(project_id, auth.uid()));

-- ============================================================================
-- 9. Realtime
-- ============================================================================
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.project_members;
alter publication supabase_realtime add table public.workspace_members;

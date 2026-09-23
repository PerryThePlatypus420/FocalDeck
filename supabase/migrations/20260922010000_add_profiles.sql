-- Adds a public-schema mirror of auth.users so PostgREST can embed user
-- display info (name/email) into workspace/project member queries --
-- auth.users itself isn't exposed to the API.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Visible to yourself, and to anyone who shares a workspace with you
-- (project members are always workspace members too, so this covers both).
create policy profiles_select on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs
      on theirs.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id
  )
);

-- Keep profiles in sync with new signups.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill accounts created before this migration existed.
insert into public.profiles (id, full_name, email)
select id, raw_user_meta_data ->> 'full_name', email
from auth.users
on conflict (id) do nothing;

-- Lets PostgREST embed `profiles` when querying workspace_members.
-- workspace_members.user_id already references auth.users directly; this
-- is an additional, always-consistent FK to the same rows via their public
-- mirror (profiles.id is itself FK'd to auth.users.id).
alter table public.workspace_members
  add constraint workspace_members_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- Lets an invite link be previewed before the invitee is a workspace member
-- (and even before they have an account) without exposing the full
-- workspace_invites row, which normal RLS restricts to workspace
-- owner/manager/admin or the inviting project's lead.
create or replace function public.get_invite_preview(p_token uuid)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  -- coalesce to a plain {"valid": false} when the token matches no row at
  -- all -- otherwise a bad token would return SQL NULL instead of JSON the
  -- caller can safely check `.valid` on.
  select coalesce(
    (
      select jsonb_build_object(
        'valid', (wi.accepted_at is null and wi.expires_at > now()),
        'workspaceId', wi.workspace_id,
        'workspaceName', w.name,
        'projectId', wi.project_id,
        'projectName', p.name,
        'role', wi.role,
        'projectRole', wi.project_role
      )
      from public.workspace_invites wi
      join public.workspaces w on w.id = wi.workspace_id
      left join public.projects p on p.id = wi.project_id
      where wi.token = p_token
    ),
    jsonb_build_object('valid', false)
  );
$$;

-- Callable by anyone, including logged-out visitors who just opened the
-- link and haven't signed up yet.
grant execute on function public.get_invite_preview(uuid) to authenticated, anon;

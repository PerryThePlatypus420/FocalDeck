"use server";

import { createClient } from "@/lib/supabase/server";
import type { InvitePreview } from "@/types/invite";
import type { ProjectRole } from "@/types/project";
import type { WorkspaceRole } from "@/types/workspace";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function buildInviteUrl(token: string): string {
  return `${APP_URL}/invite/${token}`;
}

/**
 * Generate a copy-link invite to a workspace
 */
export async function createWorkspaceInvite(
  workspaceId: string,
  role: Exclude<WorkspaceRole, "owner">,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({ workspace_id: workspaceId, role, invited_by: user.id })
    .select("token")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Failed to create invite",
    };
  }

  return { success: true as const, url: buildInviteUrl(data.token) };
}

/**
 * Generate a copy-link invite straight into a project. Grants base 'member'
 * workspace access if the invitee isn't already a member (enforced by the
 * workspace_invites_project_role_scope DB constraint).
 */
export async function createProjectInvite(
  workspaceId: string,
  projectId: string,
  projectRole: ProjectRole,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      project_role: projectRole,
      role: "member",
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Failed to create invite",
    };
  }

  return { success: true as const, url: buildInviteUrl(data.token) };
}

/**
 * Read-only preview of an invite, safe to show before the viewer is a
 * workspace member (or even signed in) -- see get_invite_preview() RPC.
 */
export async function getInvitePreview(token: string): Promise<InvitePreview> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_invite_preview", {
    p_token: token,
  });

  const empty: InvitePreview = {
    valid: false,
    workspaceId: null,
    workspaceName: null,
    projectId: null,
    projectName: null,
    role: null,
    projectRole: null,
  };

  if (error || !data) {
    return empty;
  }

  const preview = data as unknown as {
    valid: boolean;
    workspaceId: string | null;
    workspaceName: string | null;
    projectId: string | null;
    projectName: string | null;
    role: WorkspaceRole | null;
    projectRole: ProjectRole | null;
  };

  return {
    valid: preview.valid,
    workspaceId: preview.workspaceId ?? null,
    workspaceName: preview.workspaceName ?? null,
    projectId: preview.projectId ?? null,
    projectName: preview.projectName ?? null,
    role: preview.role ?? null,
    projectRole: preview.projectRole ?? null,
  };
}

/**
 * Accept an invite by token. The invitee must already be signed in.
 */
export async function acceptInvite(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { data, error } = await supabase.rpc("accept_workspace_invite", {
    p_token: token,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  const result = data as unknown as {
    workspace_id: string;
    workspace_role: WorkspaceRole;
    project_id: string | null;
    project_role: ProjectRole | null;
  };

  return {
    success: true as const,
    workspaceId: result.workspace_id,
    projectId: result.project_id,
  };
}

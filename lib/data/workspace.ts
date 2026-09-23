import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ProjectSummary } from "@/types/project";
import type { WorkspaceDetail, WorkspaceMemberSummary } from "@/types/workspace";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getWorkspaceDetail(
  supabase: TypedSupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceDetail | null> {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, description")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!workspace) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }
  if (!membership) {
    return null;
  }

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    role: membership.role,
  };
}

export async function getProjectSummaries(
  supabase: TypedSupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<ProjectSummary[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const projectIds = projects.map((project) => project.id);
  const roles = await getProjectRoles(supabase, projectIds, userId);

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    role: roles.get(project.id) ?? null,
  }));
}

export async function getWorkspaceMembers(
  supabase: TypedSupabaseClient,
  workspaceId: string,
): Promise<WorkspaceMemberSummary[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, profiles(full_name, email)")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw error;
  }

  return data
    .filter((row) => row.profiles !== null)
    .map((row) => ({
      userId: row.user_id,
      fullName: row.profiles!.full_name,
      email: row.profiles!.email,
      role: row.role,
    }));
}

async function getProjectRoles(
  supabase: TypedSupabaseClient,
  projectIds: string[],
  userId: string,
) {
  const roles = new Map<string, Database["public"]["Enums"]["project_role"]>();

  if (projectIds.length === 0) {
    return roles;
  }

  const { data, error } = await supabase
    .from("project_members")
    .select("project_id, role")
    .eq("user_id", userId)
    .in("project_id", projectIds);

  if (error) {
    throw error;
  }

  for (const row of data) {
    roles.set(row.project_id, row.role);
  }
  return roles;
}

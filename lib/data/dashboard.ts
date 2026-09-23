import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { Database } from "@/types/database.types";
import type { WorkspaceSummary } from "@/types/workspace";

type TypedSupabaseClient = SupabaseClient<Database>;

// Cached per request: both the (app) layout (workspace switcher) and the
// dashboard page (workspace cards) need this same list.
export const getWorkspaceSummaries = cache(async (
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<WorkspaceSummary[]> => {
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, description)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const workspaceIds = memberships
    .map((membership) => membership.workspaces?.id)
    .filter((id): id is string => Boolean(id));

  const memberCounts = await getMemberCounts(supabase, workspaceIds);

  return memberships
    .filter((membership) => membership.workspaces !== null)
    .map((membership) => {
      const workspace = membership.workspaces!;
      return {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        role: membership.role,
        memberCount: memberCounts.get(workspace.id) ?? 0,
      };
    });
});

async function getMemberCounts(
  supabase: TypedSupabaseClient,
  workspaceIds: string[],
): Promise<Map<string, number>> {
  if (workspaceIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .in("workspace_id", workspaceIds);

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.workspace_id, (counts.get(row.workspace_id) ?? 0) + 1);
  }
  return counts;
}

export interface DashboardStats {
  totalTasks: number;
  dueToday: number;
  assignedToMe: number;
}

export async function getDashboardStats(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);

  const [totalTasks, dueToday, assignedToMe] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("due_date", today),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assignee_id", userId),
  ]);

  for (const result of [totalTasks, dueToday, assignedToMe]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    totalTasks: totalTasks.count ?? 0,
    dueToday: dueToday.count ?? 0,
    assignedToMe: assignedToMe.count ?? 0,
  };
}

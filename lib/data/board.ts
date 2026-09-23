import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { ProjectDetail, ProjectMemberOption } from "@/types/project";
import type { BoardColumn, TaskCard } from "@/types/task";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getProjectDetail(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<ProjectDetail | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    name: data.name,
    description: data.description,
  };
}

export async function getBoardColumns(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<BoardColumn[]> {
  const { data, error } = await supabase
    .from("project_columns")
    .select("id, name, position")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }
  return data;
}

export async function getBoardTasks(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<TaskCard[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, column_id, position, title, description, priority, due_date, assignee:profiles(id, full_name, email)",
    )
    .eq("project_id", projectId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((task) => ({
    id: task.id,
    columnId: task.column_id,
    position: task.position,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.due_date,
    assignee: task.assignee
      ? {
          userId: task.assignee.id,
          fullName: task.assignee.full_name,
          email: task.assignee.email,
        }
      : null,
  }));
}

export async function getProjectMembers(
  supabase: TypedSupabaseClient,
  projectId: string,
): Promise<ProjectMemberOption[]> {
  const { data, error } = await supabase
    .from("project_members")
    .select("user_id, role, profiles(full_name, email)")
    .eq("project_id", projectId);

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

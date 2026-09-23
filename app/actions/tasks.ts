"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/types/task";

/**
 * Create a task in a project's column
 */
export async function createTask(
  workspaceId: string,
  projectId: string,
  columnId: string,
  title: string,
  description: string,
  priority: TaskPriority,
  dueDate: string | null,
  assigneeId: string | null,
) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { success: false as const, error: "Task title is required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { count, error: countError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("column_id", columnId);

  if (countError) {
    return { success: false as const, error: countError.message };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      column_id: columnId,
      title: trimmedTitle,
      description: description.trim() || null,
      priority,
      due_date: dueDate,
      assignee_id: assigneeId,
      created_by: user.id,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Failed to create task",
    };
  }

  revalidatePath(`/workspace/${workspaceId}/project/${projectId}`);

  return { success: true as const, taskId: data.id };
}

export interface UpdateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}

/**
 * Edit a task's details (from the task detail panel)
 */
export async function updateTask(taskId: string, updates: UpdateTaskInput) {
  const trimmedTitle = updates.title.trim();

  if (!trimmedTitle) {
    return { success: false as const, error: "Task title is required" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      title: trimmedTitle,
      description: updates.description.trim() || null,
      priority: updates.priority,
      due_date: updates.dueDate,
      assignee_id: updates.assigneeId,
    })
    .eq("id", taskId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

/**
 * Soft-archive a task so it stops accumulating on the board without being
 * deleted (see WORKFLOW.md's manual-archive decision).
 */
export async function archiveTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath(`/workspace/${workspaceId}/project/${projectId}`);

  return { success: true as const };
}

export interface TaskPositionUpdate {
  taskId: string;
  columnId: string;
  position: number;
}

/**
 * Persist a drag-and-drop reorder in the background. Deliberately does not
 * revalidate the page -- the board already reflects the new order
 * optimistically, and forcing a refetch here would cause a visible flicker
 * right after every drop.
 */
export async function reorderTasks(updates: TaskPositionUpdate[]) {
  const supabase = await createClient();

  const results = await Promise.all(
    updates.map(({ taskId, columnId, position }) =>
      supabase
        .from("tasks")
        .update({ column_id: columnId, position })
        .eq("id", taskId),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { success: false as const, error: failed.error.message };
  }

  return { success: true as const };
}

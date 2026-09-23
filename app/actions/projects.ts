"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Create a project inside a workspace, owned (as Lead) by the current user
 */
export async function createProject(
  workspaceId: string,
  name: string,
  description: string,
) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false as const, error: "Project name is required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name: trimmedName,
      description: description.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Failed to create project",
    };
  }

  revalidatePath(`/workspace/${workspaceId}`);

  return { success: true as const, projectId: data.id };
}

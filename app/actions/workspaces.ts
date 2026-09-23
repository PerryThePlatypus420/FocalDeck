"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Create a workspace owned by the current user
 */
export async function createWorkspace(name: string, description: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false as const, error: "Workspace name is required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be signed in" };
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: trimmedName,
      description: description.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "Failed to create workspace",
    };
  }

  revalidatePath("/dashboard");

  return { success: true as const, workspaceId: data.id };
}

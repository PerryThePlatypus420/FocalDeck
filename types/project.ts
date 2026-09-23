import type { Database } from "@/types/database.types";

export type ProjectRole = Database["public"]["Enums"]["project_role"];

// A workspace-view list item: the user's project role is null when they can
// only see the project via elevated workspace access (Owner/Manager/Admin),
// not because they're an actual project_members row.
export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  role: ProjectRole | null;
}

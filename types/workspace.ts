import type { Database } from "@/types/database.types";

export type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

// A dashboard-list view model: aggregates a `workspaces` row with the
// current user's role and a member count, neither of which is a plain
// table row on its own, so this stays a hand-defined shape.
export interface WorkspaceSummary {
  id: string;
  name: string;
  description: string | null;
  role: WorkspaceRole;
  memberCount: number;
}

// The single-workspace view model for /workspace/[workspaceId].
export interface WorkspaceDetail {
  id: string;
  name: string;
  description: string | null;
  role: WorkspaceRole;
}

export interface WorkspaceMemberSummary {
  userId: string;
  fullName: string | null;
  email: string;
  role: WorkspaceRole;
}

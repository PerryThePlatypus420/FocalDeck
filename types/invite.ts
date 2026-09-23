import type { ProjectRole } from "@/types/project";
import type { WorkspaceRole } from "@/types/workspace";

export interface InvitePreview {
  valid: boolean;
  workspaceId: string | null;
  workspaceName: string | null;
  projectId: string | null;
  projectName: string | null;
  role: WorkspaceRole | null;
  projectRole: ProjectRole | null;
}

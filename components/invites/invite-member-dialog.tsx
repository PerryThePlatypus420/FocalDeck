"use client";

import type { ReactNode } from "react";

import { createWorkspaceInvite } from "@/app/actions/invites";
import { InviteLinkDialog } from "@/components/invites/invite-link-dialog";
import type { WorkspaceRole } from "@/types/workspace";

type InvitableWorkspaceRole = Exclude<WorkspaceRole, "owner">;

const roleOptions: { value: InvitableWorkspaceRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
];

interface InviteMemberDialogProps {
  workspaceId: string;
  trigger: ReactNode;
}

export function InviteMemberDialog({
  workspaceId,
  trigger,
}: InviteMemberDialogProps) {
  return (
    <InviteLinkDialog
      title="Invite to workspace"
      description="Share this link to invite someone to your workspace."
      roleLabel="Role"
      roleOptions={roleOptions}
      defaultRole="member"
      onGenerate={(role) =>
        createWorkspaceInvite(workspaceId, role as InvitableWorkspaceRole)
      }
      trigger={trigger}
    />
  );
}

"use client";

import type { ReactNode } from "react";

import { createProjectInvite } from "@/app/actions/invites";
import { InviteLinkDialog } from "@/components/invites/invite-link-dialog";
import type { ProjectRole } from "@/types/project";

const roleOptions: { value: ProjectRole; label: string }[] = [
  { value: "contributor", label: "Contributor" },
  { value: "lead", label: "Lead" },
];

interface InviteToProjectDialogProps {
  workspaceId: string;
  projectId: string;
  trigger: ReactNode;
}

export function InviteToProjectDialog({
  workspaceId,
  projectId,
  trigger,
}: InviteToProjectDialogProps) {
  return (
    <InviteLinkDialog
      title="Invite to project"
      description="Share this link to invite someone to this project."
      roleLabel="Project role"
      roleOptions={roleOptions}
      defaultRole="contributor"
      onGenerate={(role) =>
        createProjectInvite(workspaceId, projectId, role as ProjectRole)
      }
      trigger={trigger}
    />
  );
}

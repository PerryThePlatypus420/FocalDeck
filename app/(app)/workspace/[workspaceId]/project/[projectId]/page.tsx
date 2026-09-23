import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAuthenticatedUser } from "@/lib/auth";
import {
  getBoardColumns,
  getBoardTasks,
  getProjectDetail,
  getProjectMembers,
} from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/board/kanban-board";
import { InviteToProjectDialog } from "@/components/invites/invite-to-project-dialog";
import { MemberAvatarStack } from "@/components/shared/member-avatar-stack";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Project | FocalDeck",
};

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = await params;

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const project = await getProjectDetail(supabase, projectId);
  if (!project || project.workspaceId !== workspaceId) {
    notFound();
  }

  const [columns, tasks, members] = await Promise.all([
    getBoardColumns(supabase, projectId),
    getBoardTasks(supabase, projectId),
    getProjectMembers(supabase, projectId),
  ]);

  const isLead = members.some(
    (member) => member.userId === user.id && member.role === "lead",
  );

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/workspace/${workspaceId}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            Back to workspace
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <MemberAvatarStack members={members} />
          {isLead && (
            <InviteToProjectDialog
              workspaceId={workspaceId}
              projectId={projectId}
              trigger={
                <Button variant="outline" size="sm">
                  Invite
                </Button>
              }
            />
          )}
        </div>
      </div>

      <KanbanBoard
        workspaceId={workspaceId}
        projectId={projectId}
        columns={columns}
        initialTasks={tasks}
        members={members}
      />
    </div>
  );
}

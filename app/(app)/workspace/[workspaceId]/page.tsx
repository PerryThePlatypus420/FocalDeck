import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";

import { getAuthenticatedUser } from "@/lib/auth";
import {
  getProjectSummaries,
  getWorkspaceDetail,
  getWorkspaceMembers,
} from "@/lib/data/workspace";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/workspace/create-project-dialog";
import { MemberList } from "@/components/workspace/member-list";
import { ProjectCard } from "@/components/workspace/project-card";

export const metadata: Metadata = {
  title: "Workspace | FocalDeck",
};

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const workspace = await getWorkspaceDetail(supabase, workspaceId, user.id);
  if (!workspace) {
    notFound();
  }

  const [projects, members] = await Promise.all([
    getProjectSummaries(supabase, workspaceId, user.id),
    getWorkspaceMembers(supabase, workspaceId),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
        </div>
        <CreateProjectDialog
          workspaceId={workspace.id}
          trigger={
            <Button>
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
              New Project
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderKanban size={24} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Create your first project
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Projects are only visible to the people you add to them.
              </p>
              <CreateProjectDialog
                workspaceId={workspace.id}
                trigger={<Button size="sm">Create project</Button>}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  workspaceId={workspace.id}
                  project={project}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Members ({members.length})
          </h2>
          <MemberList members={members} />
        </div>
      </div>
    </div>
  );
}

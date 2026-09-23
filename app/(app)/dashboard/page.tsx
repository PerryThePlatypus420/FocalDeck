import type { Metadata } from "next";
import { CalendarClock, FolderKanban, LayoutGrid, Plus, UserCheck } from "lucide-react";

import { getAuthenticatedUser } from "@/lib/auth";
import { getDashboardStats, getWorkspaceSummaries } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/dashboard/create-workspace-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { WorkspaceCard } from "@/components/dashboard/workspace-card";

export const metadata: Metadata = {
  title: "Dashboard | FocalDeck",
  description: "Your FocalDeck workspace dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const [workspaces, stats] = await Promise.all([
    getWorkspaceSummaries(supabase, user.id),
    getDashboardStats(supabase, user.id),
  ]);
  const statCards = [
    { label: "Total Tasks", value: stats.totalTasks, icon: LayoutGrid },
    { label: "Due Today", value: stats.dueToday, icon: CalendarClock },
    { label: "Assigned to Me", value: stats.assignedToMe, icon: UserCheck },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <CreateWorkspaceDialog
          trigger={
            <Button>
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
              New Workspace
            </Button>
          }
        />
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FolderKanban size={24} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">
            Create your first workspace
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Workspaces keep your projects, teammates, and tasks organized in
            one place.
          </p>
          <CreateWorkspaceDialog
            trigger={<Button size="sm">Create workspace</Button>}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Your workspaces
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

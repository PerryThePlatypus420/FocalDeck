import type { ReactNode } from "react";

import { Sidebar } from "@/components/shell/sidebar";
import type { WorkspaceSummary } from "@/types/workspace";

interface AppShellProps {
  userName: string;
  userEmail: string;
  workspaces: WorkspaceSummary[];
  children: ReactNode;
}

export function AppShell({
  userName,
  userEmail,
  workspaces,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} userEmail={userEmail} workspaces={workspaces} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

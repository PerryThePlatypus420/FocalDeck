import type { ReactNode } from "react";

import { Sidebar } from "@/components/shell/sidebar";

interface AppShellProps {
  userName: string;
  userEmail: string;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

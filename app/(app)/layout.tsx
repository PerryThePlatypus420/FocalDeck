import type { ReactNode } from "react";

import { getAuthenticatedUser } from "@/lib/auth";
import { getWorkspaceSummaries } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  const fullName = user.user_metadata?.full_name || "User";
  const email = user.email ?? "";
  const workspaces = await getWorkspaceSummaries(supabase, user.id);

  return (
    <AppShell userName={fullName} userEmail={email} workspaces={workspaces}>
      {children}
    </AppShell>
  );
}

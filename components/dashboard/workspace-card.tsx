import Link from "next/link";
import { Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkspaceRole, WorkspaceSummary } from "@/types/workspace";

const roleLabels: Record<WorkspaceRole, string> = {
  owner: "Owner",
  manager: "Manager",
  admin: "Admin",
  member: "Member",
};

interface WorkspaceCardProps {
  workspace: WorkspaceSummary;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${workspace.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {workspace.name}
            </CardTitle>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
              {roleLabels[workspace.role]}
            </span>
          </div>
          {workspace.description && (
            <CardDescription className="line-clamp-2">
              {workspace.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users size={14} strokeWidth={1.75} aria-hidden="true" />
          {workspace.memberCount}{" "}
          {workspace.memberCount === 1 ? "member" : "members"}
        </CardContent>
      </Card>
    </Link>
  );
}

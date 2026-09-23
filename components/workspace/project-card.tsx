import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectRole, ProjectSummary } from "@/types/project";

const roleLabels: Record<ProjectRole, string> = {
  lead: "Lead",
  contributor: "Contributor",
};

interface ProjectCardProps {
  workspaceId: string;
  project: ProjectSummary;
}

export function ProjectCard({ workspaceId, project }: ProjectCardProps) {
  return (
    <Link href={`/workspace/${workspaceId}/project/${project.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {project.name}
            </CardTitle>
            {project.role && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                {roleLabels[project.role]}
              </span>
            )}
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}

import type { WorkspaceMemberSummary, WorkspaceRole } from "@/types/workspace";

const roleLabels: Record<WorkspaceRole, string> = {
  owner: "Owner",
  manager: "Manager",
  admin: "Admin",
  member: "Member",
};

interface MemberListProps {
  members: WorkspaceMemberSummary[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {getInitials(member.fullName, member.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {member.fullName || member.email}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {member.email}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
            {roleLabels[member.role]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const initials = fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    if (initials) return initials;
  }
  return email[0]?.toUpperCase() ?? "?";
}

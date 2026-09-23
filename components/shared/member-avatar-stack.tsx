import { getInitials } from "@/lib/format";

interface AvatarMember {
  userId: string;
  fullName: string | null;
  email: string;
}

interface MemberAvatarStackProps {
  members: AvatarMember[];
  max?: number;
}

export function MemberAvatarStack({ members, max = 5 }: MemberAvatarStackProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <span
          key={member.userId}
          className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background"
          title={member.fullName || member.email}
        >
          {getInitials(member.fullName, member.email)}
        </span>
      ))}
      {overflow > 0 && (
        <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  );
}

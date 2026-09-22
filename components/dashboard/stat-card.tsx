import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-semibold tabular-nums text-foreground">
            {value}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {label}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}

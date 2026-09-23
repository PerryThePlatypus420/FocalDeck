"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { CalendarClock } from "lucide-react";

import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/board/priority-badge";
import type { TaskCard as TaskCardData } from "@/types/task";

interface TaskCardProps {
  task: TaskCardData;
  index: number;
  onOpen: (task: TaskCardData) => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  index,
  onOpen,
}: TaskCardProps) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    type: "task",
    accept: ["task"],
    group: task.columnId,
  });

  const isOverdue = isTaskOverdue(task.dueDate);

  return (
    // The ref is on this plain div, not the Card component, so there's no
    // doubt it reaches the real DOM node dnd-kit needs to bind pointer
    // listeners to. cursor-grab/active:cursor-grabbing is pure CSS: it
    // naturally covers hover (grab), the whole mousedown-to-mouseup drag
    // (grabbing, via :active), and reverts on release automatically.
    <div
      ref={ref}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <Card
        onClick={() => onOpen(task)}
        className="cursor-pointer transition-shadow hover:shadow-md"
      >
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs text-muted-foreground",
                  isOverdue && "text-destructive",
                )}
              >
                <CalendarClock
                  size={12}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
          {task.assignee && (
            <span
              className="flex size-6 items-center justify-center self-end rounded-full bg-primary/10 text-[0.625rem] font-medium text-primary"
              title={task.assignee.fullName || task.assignee.email}
            >
              {getInitials(task.assignee.fullName, task.assignee.email)}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

function isTaskOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

function formatDueDate(dueDate: string): string {
  // Fixed locale, not the runtime default: the server process and the
  // browser can default to different locales (e.g. "Sep 23" vs "23 Sept"),
  // which is a guaranteed SSR hydration mismatch if left to `undefined`.
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

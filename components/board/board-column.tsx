"use client";

import { memo } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/board/create-task-dialog";
import { TaskCard } from "@/components/board/task-card";
import type { ProjectMemberOption } from "@/types/project";
import type {
  BoardColumn as BoardColumnData,
  TaskCard as TaskCardData,
} from "@/types/task";

interface BoardColumnProps {
  workspaceId: string;
  projectId: string;
  column: BoardColumnData;
  tasks: TaskCardData[];
  members: ProjectMemberOption[];
  onOpenTask: (task: TaskCardData) => void;
}

export const BoardColumn = memo(function BoardColumn({
  workspaceId,
  projectId,
  column,
  tasks,
  members,
  onOpenTask,
}: BoardColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: "column",
    accept: ["task"],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">
          {column.name}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({tasks.length})
          </span>
        </h3>
        <CreateTaskDialog
          workspaceId={workspaceId}
          projectId={projectId}
          columnId={column.id}
          members={members}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Add task to ${column.name}`}
            >
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          }
        />
      </div>

      <div
        ref={ref}
        className={cn(
          "flex min-h-16 flex-1 flex-col gap-2 rounded-lg bg-muted/40 p-2 outline-2 outline-offset-2 outline-transparent transition-colors",
          isDropTarget && "bg-primary/5 outline-primary/40",
        )}
      >
        <AnimatePresence initial={false}>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <TaskCard task={task} index={index} onOpen={onOpenTask} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

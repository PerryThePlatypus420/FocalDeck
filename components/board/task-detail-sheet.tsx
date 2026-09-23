"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2 } from "lucide-react";

import { archiveTask, updateTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectMemberOption } from "@/types/project";
import type { TaskCard, TaskPriority } from "@/types/task";

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const UNASSIGNED = "unassigned";

interface TaskDetailSheetProps {
  workspaceId: string;
  projectId: string;
  task: TaskCard | null;
  members: ProjectMemberOption[];
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({
  workspaceId,
  projectId,
  task,
  members,
  onOpenChange,
}: TaskDetailSheetProps) {
  // Keeps the last-opened task's content rendered while the sheet plays its
  // closing animation, instead of unmounting the moment `task` goes null.
  // Adjusted during render (React's sanctioned alternative to an effect for
  // deriving state from a changing prop) rather than via useEffect.
  const [displayedTask, setDisplayedTask] = useState<TaskCard | null>(task);
  if (task !== null && task !== displayedTask) {
    setDisplayedTask(task);
  }

  return (
    <Sheet open={task !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription>
            Changes save when you click Save.
          </SheetDescription>
        </SheetHeader>

        {displayedTask && (
          <TaskDetailForm
            key={displayedTask.id}
            workspaceId={workspaceId}
            projectId={projectId}
            task={displayedTask}
            members={members}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface TaskDetailFormProps {
  workspaceId: string;
  projectId: string;
  task: TaskCard;
  members: ProjectMemberOption[];
  onDone: () => void;
}

function TaskDetailForm({
  workspaceId,
  projectId,
  task,
  members,
  onDone,
}: TaskDetailFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(
    task.assignee?.userId ?? UNASSIGNED,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const result = await updateTask(task.id, {
      title,
      description,
      priority,
      dueDate: dueDate || null,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onDone();
    router.refresh();
  }

  async function handleArchive() {
    setIsArchiving(true);
    setError(null);

    const result = await archiveTask(workspaceId, projectId, task.id);

    if (!result.success) {
      setError(result.error);
      setIsArchiving(false);
      return;
    }

    setIsArchiving(false);
    onDone();
    router.refresh();
  }

  const isBusy = isSaving || isArchiving;

  return (
    <>
      <div className="flex flex-col gap-4 px-6">
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="detail-title">Title</Label>
          <Input
            id="detail-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="detail-description">Description</Label>
          <Textarea
            id="detail-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isBusy}
            placeholder="Add more detail..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
              disabled={isBusy}
            >
              <SelectTrigger id="detail-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="detail-due-date">Due date</Label>
            <Input
              id="detail-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="detail-assignee">Assignee</Label>
          <Select
            value={assigneeId}
            onValueChange={setAssigneeId}
            disabled={isBusy}
          >
            <SelectTrigger id="detail-assignee" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.fullName || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SheetFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleArchive()}
          disabled={isBusy}
        >
          {isArchiving ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Archive size={16} strokeWidth={1.75} aria-hidden="true" />
          )}
          Archive
        </Button>
        <Button type="button" onClick={() => void handleSave()} disabled={isBusy}>
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </SheetFooter>
    </>
  );
}

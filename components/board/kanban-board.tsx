"use client";

import { useState } from "react";
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

import { reorderTasks } from "@/app/actions/tasks";
import { BoardColumn } from "@/components/board/board-column";
import { TaskDetailSheet } from "@/components/board/task-detail-sheet";
import type { ProjectMemberOption } from "@/types/project";
import type {
  BoardColumn as BoardColumnData,
  TaskCard as TaskCardData,
} from "@/types/task";

interface KanbanBoardProps {
  workspaceId: string;
  projectId: string;
  columns: BoardColumnData[];
  initialTasks: TaskCardData[];
  members: ProjectMemberOption[];
}

export function KanbanBoard({
  workspaceId,
  projectId,
  columns,
  initialTasks,
  members,
}: KanbanBoardProps) {
  const [tasksByColumn, setTasksByColumn] = useState<
    Record<string, TaskCardData[]>
  >(() => groupTasksByColumn(columns, initialTasks));
  // Tracks the last `initialTasks` reference the board synced from. Plain
  // useState's initializer only runs once on mount, so without this,
  // whenever the server gives us fresh data (e.g. after creating a task and
  // router.refresh()), the board's local state would keep ignoring it --
  // exactly why a new task previously didn't show up without a full manual
  // page reload. This is React's documented "adjust state during render"
  // pattern for resyncing local state when a prop actually changes.
  const [syncedTasks, setSyncedTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskCardData | null>(null);

  if (initialTasks !== syncedTasks) {
    setSyncedTasks(initialTasks);
    setTasksByColumn(groupTasksByColumn(columns, initialTasks));
  }

  function handleDragOver(event: DragOverEvent) {
    setTasksByColumn((current) => restampColumnIds(move(current, event)));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      return;
    }

    void persistOrder(tasksByColumn);
  }

  async function persistOrder(current: Record<string, TaskCardData[]>) {
    const updates = Object.entries(current).flatMap(([columnId, tasks]) =>
      tasks.map((task, index) => ({
        taskId: task.id,
        columnId,
        position: index,
      })),
    );

    const result = await reorderTasks(updates);
    if (!result.success) {
      console.error("Failed to persist task order:", result.error);
    }
  }

  return (
    <>
      <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              workspaceId={workspaceId}
              projectId={projectId}
              column={column}
              tasks={tasksByColumn[column.id] ?? []}
              members={members}
              onOpenTask={setSelectedTask}
            />
          ))}
        </div>
      </DragDropProvider>

      <TaskDetailSheet
        workspaceId={workspaceId}
        projectId={projectId}
        task={selectedTask}
        members={members}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />
    </>
  );
}

// `move()` relocates task objects between the arrays keyed by column id, but
// it has no notion of a `columnId` field on those objects, so it never
// updates it. Without this, a task's own `columnId` (which useSortable reads
// for its `group`) goes stale the moment it crosses into another column,
// confusing `move()` on the very next dragover event of the same gesture.
//
// Only touched columns get a new array reference (and only tasks that
// actually need restamping get a new object reference) -- columns move()
// didn't touch at all pass through unchanged. That reference stability is
// what lets BoardColumn's React.memo actually skip re-rendering every other
// column on each dragover tick, instead of the whole board re-rendering.
function restampColumnIds(
  tasksByColumn: Record<string, TaskCardData[]>,
): Record<string, TaskCardData[]> {
  const result: Record<string, TaskCardData[]> = {};
  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    const needsRestamp = tasks.some((task) => task.columnId !== columnId);
    result[columnId] = needsRestamp
      ? tasks.map((task) =>
          task.columnId === columnId ? task : { ...task, columnId },
        )
      : tasks;
  }
  return result;
}

function groupTasksByColumn(
  columns: BoardColumnData[],
  tasks: TaskCardData[],
): Record<string, TaskCardData[]> {
  const grouped: Record<string, TaskCardData[]> = {};
  for (const column of columns) {
    grouped[column.id] = [];
  }
  for (const task of tasks) {
    (grouped[task.columnId] ??= []).push(task);
  }
  for (const columnTasks of Object.values(grouped)) {
    columnTasks.sort((a, b) => a.position - b.position);
  }
  return grouped;
}

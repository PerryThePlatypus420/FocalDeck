import type { Database } from "@/types/database.types";

export type TaskPriority = Database["public"]["Enums"]["task_priority"];

export interface TaskAssignee {
  userId: string;
  fullName: string | null;
  email: string;
}

export interface TaskCard {
  id: string;
  columnId: string;
  position: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: TaskAssignee | null;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
}

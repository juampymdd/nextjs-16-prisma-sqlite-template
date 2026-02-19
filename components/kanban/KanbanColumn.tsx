"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/libs/store/useTaskStore";
import { SortableTask } from "./SortableTask";
import { cn } from "@/libs/utils";

interface Props {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

export const KanbanColumn = ({ status, title, tasks }: Props) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col gap-4 w-full min-w-[300px]">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span className={cn(
              "w-2 h-2 rounded-full",
              status === "TODO" ? "bg-slate-400" :
              status === "IN_PROGRESS" ? "bg-blue-500" : "bg-green-500"
          )} />
          {title} ({tasks.length})
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-muted/30 rounded-3xl p-4 min-h-[500px] border border-border/10 flex flex-col gap-3"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

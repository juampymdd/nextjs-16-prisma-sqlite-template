"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/libs/store/useTaskStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/libs/utils";
import { Paperclip, MessageSquare, CheckSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { useState } from "react";

interface Props {
  task: Task;
}

export const SortableTask = ({ task }: Props) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const coverImage = task.attachments?.find((a) => a.type === "image");

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[100px] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setIsDetailOpen(true)}
    >
      <Card
        className={cn(
          "cursor-grab active:cursor-grabbing hover:shadow-lg transition-all rounded-2xl border-border/40 overflow-hidden group mb-3",
          task.completed && "opacity-60 bg-muted/30",
        )}
      >
        {coverImage && (
          <div className="w-full h-32 overflow-hidden border-b pointer-events-none">
            <img
              src={coverImage.url}
              alt={coverImage.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3 pointer-events-none">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm leading-tight text-foreground/90">
              {task.title}
            </p>
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="h-6 w-6 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Pencil size={12} />
              </div>
            </div>
          </div>

          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-3 pt-1">
            <span
              className={cn(
                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter",
                task.priority === "high"
                  ? "bg-red-500/10 text-red-500"
                  : task.priority === "medium"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-blue-500/10 text-blue-500",
              )}
            >
              {task.priority}
            </span>

            <div className="flex items-center gap-2 ml-auto text-muted-foreground">
              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-0.5 text-[10px]">
                  <Paperclip size={12} />
                  <span>{task.attachments.length}</span>
                </div>
              )}
              {task.subtasks?.length > 0 && (
                <div className="flex items-center gap-0.5 text-[10px]">
                  <CheckSquare size={12} />
                  <span>
                    {task.subtasks.filter((s) => s.completed).length}/
                    {task.subtasks.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog
        task={task}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
};

"use client";

import { Task, ProjectColumn, useTaskStore } from "@/libs/store/useTaskStore";
import { SortableTask } from "./SortableTask";
import { cn } from "@/libs/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  column: ProjectColumn;
  tasks: Task[];
}

export const KanbanColumn = ({ column, tasks }: Props) => {
  const { deleteColumn } = useTaskStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    await deleteColumn(column.projectId, column.id);
    setIsConfirmOpen(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-4 min-w-[320px] max-w-[320px] opacity-40 border-2 border-dashed border-primary/20 rounded-[2rem] h-[600px] bg-primary/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-4 min-w-[320px] max-w-[320px]"
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-muted/20 rounded-2xl border border-border/5 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: column.color || "#3b82f6" }}
          />
          {column.name}{" "}
          <span className="ml-1 opacity-50">({tasks.length})</span>
        </h3>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        {/* ... existing code ... */}
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>¿Eliminar este tablero?</DialogTitle>
            <DialogDescription className="py-2">
              Esta acción eliminará el tablero <strong>"{column.name}"</strong>{" "}
              y moverá todas las tareas asociadas al tablero anterior
              disponible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl font-bold"
            >
              Eliminar Tablero
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 bg-muted/40 rounded-[2rem] p-4 min-h-[600px] border border-border/10 flex flex-col gap-4 backdrop-blur-sm shadow-inner">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-[1.5rem]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              Vacío
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

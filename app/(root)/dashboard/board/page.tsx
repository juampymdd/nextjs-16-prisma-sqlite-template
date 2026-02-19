"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/tasks";

export default function BoardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTasks();
  }, [fetchTasks]);

  if (!isClient) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Tablero Kanban
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus tareas arrastrándolas entre estados.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent">
            <DialogHeader className="sr-only">
              <DialogTitle>Nueva Tarea</DialogTitle>
              <DialogDescription>Añadir tarea al tablero</DialogDescription>
            </DialogHeader>
            <CreateTaskForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <KanbanBoard tasks={tasks} />
    </div>
  );
}

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
  const {
    tasks,
    fetchTasks,
    projects,
    fetchProjects,
    activeProjectId,
    setActiveProject,
  } = useTaskStore();
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  // If no project selected, select the first one
  useEffect(() => {
    if (isClient && !activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [isClient, activeProjectId, projects, setActiveProject]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectTasks = tasks.filter(
    (t) => !activeProjectId || t.projectId === activeProjectId,
  );

  if (!isClient) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2 border-b border-border/50">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            Tablero Global
          </h1>
          <div className="flex items-center gap-2 pl-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {activeProject
                ? `Enfoque: ${activeProject.name}`
                : "Selecciona un proyecto para empezar"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/20 p-2 rounded-[2rem] border border-border/10 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
              Proyecto activo
            </span>
            <select
              className="bg-background/50 border border-white/5 rounded-xl px-4 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-inner"
              value={activeProjectId || ""}
              onChange={(e) => setActiveProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-border/40 mx-1 hidden sm:block" />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 font-black text-[11px] uppercase tracking-[0.15em] bg-primary hover:bg-primary/90 transition-all active:scale-95 group"
                disabled={!activeProjectId}
              >
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />{" "}
                Nueva Tarea
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
      </div>

      {activeProject ? (
        <KanbanBoard
          tasks={projectTasks}
          columns={activeProject.columns || []}
          projectId={activeProject.id}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground">No hay proyectos disponibles.</p>
        </div>
      )}
    </div>
  );
}

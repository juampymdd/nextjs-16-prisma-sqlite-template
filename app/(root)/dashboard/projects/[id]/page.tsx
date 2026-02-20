"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Folder,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { TaskItem, CreateTaskForm } from "@/components/tasks";
import { CollaboratorManager } from "@/components/projects/CollaboratorManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const {
    projects,
    tasks,
    fetchTasks,
    fetchProject,
    deleteProject,
    updateProject,
  } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");

  const project = projects.find((p) => p.id === id);
  const projectTasks = tasks.filter((t) => t.projectId === id);

  const { totalTasksCount, completedTasksCount, completionPercentage } =
    useMemo(() => {
      const total = projectTasks.length;
      const completed = projectTasks.filter((t) => t.completed).length;
      return {
        totalTasksCount: total,
        completedTasksCount: completed,
        completionPercentage: total > 0 ? (completed / total) * 100 : 0,
      };
    }, [projectTasks]);

  useEffect(() => {
    fetchTasks();
    if (id) fetchProject(id as string);
  }, [fetchTasks, fetchProject, id]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Folder size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">Proyecto no encontrado</h2>
        <Button onClick={() => router.push("/dashboard/projects")}>
          Volver a Proyectos
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteProject(project.id);
    router.push("/dashboard/projects");
  };

  const handleToggleComplete = async () => {
    const newCompleted = !project.completed;
    await updateProject(project.id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:bg-muted/50 rounded-lg h-7 px-2"
            onClick={() => router.push("/dashboard/projects")}
          >
            <ArrowLeft className="mr-2 h-3 w-3" /> Volver a proyectos
          </Button>

          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10">
              <Folder size={32} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {project.name}
                </h1>
                {project.completed && (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                    Completado
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-black mt-2 pl-0.5 opacity-30 uppercase tracking-[0.4em]">
                ID PROYECTO: {project.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-background/50 backdrop-blur-2xl p-2.5 rounded-[2.8rem] border border-border/10 shadow-3xl shadow-black/10 w-fit">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-[2rem] border border-white/5 shadow-inner">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-11 rounded-[1.4rem] px-7 font-black text-[11px] uppercase tracking-widest transition-all",
                view === "list" &&
                  "bg-background shadow-xl scale-100 border border-border/5",
              )}
              onClick={() => setView("list")}
            >
              <List size={14} className="mr-2" /> Lista
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-11 rounded-[1.4rem] px-7 font-black text-[11px] uppercase tracking-widest transition-all",
                view === "kanban" &&
                  "bg-background shadow-xl scale-100 border border-border/5",
              )}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid size={14} className="mr-2" /> Kanban
            </Button>
          </div>

          <div className="h-10 w-px bg-border/20 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3">
            <CollaboratorManager project={project} />

            <div className="h-10 w-px bg-border/20 mx-1 hidden sm:block" />

            <Button
              variant={project.completed ? "outline" : "default"}
              size="sm"
              className={cn(
                "rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] h-12 px-10 transition-all duration-500",
                !project.completed
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/20 border-none"
                  : "bg-muted/40 text-muted-foreground border-border/20 hover:bg-muted/60",
              )}
              onClick={handleToggleComplete}
            >
              {project.completed ? "Reabrir" : "Cerrar Proyecto"}
            </Button>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-3xl h-12 px-10 shadow-2xl shadow-primary/30 font-black text-[11px] uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 transition-all active:scale-95 group border-none">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />{" "}
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
                <DialogHeader className="sr-only">
                  <DialogTitle>Nueva Tarea</DialogTitle>
                  <DialogDescription>
                    Formulario para crear una nueva tarea
                  </DialogDescription>
                </DialogHeader>
                <CreateTaskForm
                  onSuccess={() => setCreateOpen(false)}
                  defaultProjectId={project.id}
                />
              </DialogContent>
            </Dialog>

            <div className="h-10 w-px bg-border/20 mx-1 hidden sm:block" />

            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-[1.4rem] text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <Trash2 size={32} />
            </div>
            <DialogTitle className="text-2xl font-black">
              ¿Eliminar proyecto?
            </DialogTitle>
            <DialogDescription className="py-2 text-base">
              Estás a punto de eliminar <strong>"{project.name}"</strong>.{" "}
              <br />
              Esta acción eliminará todas las tareas y archivos asociados
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-2xl px-6 h-12 font-bold"
            >
              No, cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-destructive/20"
            >
              Sí, eliminar ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resumen del Proyecto */}
      <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-card to-muted/20 rounded-3xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Progreso General
            </h3>
            <div className="flex items-center gap-4">
              <Progress value={completionPercentage} className="h-3 flex-1" />
              <span className="text-lg font-bold">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {completedTasksCount} de {projectTasks.length} tareas completadas
            </p>
          </div>

          <div className="flex flex-col justify-center items-center border-x px-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Estado
            </h3>
            {project.completed ? (
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none px-3 py-1 rounded-full">
                Completado
              </Badge>
            ) : (
              <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none px-3 py-1 rounded-full">
                En Progreso
              </Badge>
            )}
          </div>

          <div className="flex flex-col justify-center items-end">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Finalizado el
            </h3>
            <p className="font-medium">
              {project.completedAt
                ? new Date(project.completedAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Pendiente"}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {view === "list" ? (
          <div className="grid grid-cols-1 gap-4">
            {projectTasks.length > 0 ? (
              projectTasks.map((task) => <TaskItem key={task.id} task={task} />)
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl border-muted/50">
                <p className="text-muted-foreground">
                  No hay tareas en este proyecto.
                </p>
                <Button variant="link" onClick={() => setCreateOpen(true)}>
                  Crear la primera tarea
                </Button>
              </div>
            )}
          </div>
        ) : (
          <KanbanBoard
            tasks={projectTasks}
            columns={project.columns || []}
            projectId={project.id}
          />
        )}
      </div>
    </div>
  );
}

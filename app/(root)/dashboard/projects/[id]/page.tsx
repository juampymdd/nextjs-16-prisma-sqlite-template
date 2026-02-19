"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Folder,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { TaskItem, CreateTaskForm } from "@/components/tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { projects, tasks, fetchTasks, deleteProject } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");

  const project = projects.find((p) => p.id === id);
  const projectTasks = tasks.filter((t) => t.projectId === id);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    if (
      confirm(
        "¿Estás seguro de eliminar este proyecto? Se perderán todas las tareas asociadas.",
      )
    ) {
      await deleteProject(project.id);
      router.push("/dashboard/projects");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-fit -ml-2 text-muted-foreground"
            onClick={() => router.push("/dashboard/projects")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Folder size={20} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-xl flex mr-2">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => setView("list")}
            >
              <List size={14} className="mr-2" /> Lista
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => setView("kanban")}
            >
              <LayoutGrid size={14} className="mr-2" /> Kanban
            </Button>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
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

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive rounded-xl"
            onClick={handleDelete}
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

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
          <KanbanBoard tasks={projectTasks} />
        )}
      </div>
    </div>
  );
}

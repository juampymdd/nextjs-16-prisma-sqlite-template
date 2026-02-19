"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Plus, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const { projects, deleteProject, addProject, fetchProjects } = useTaskStore();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await addProject({ name: projectName });
    setProjectName("");
    setNewProjectOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tus tareas por categorías o proyectos.
          </p>
        </div>
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Crea un nuevo proyecto para organizar tus tareas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
              <Input
                placeholder="Nombre del proyecto"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
                className="rounded-xl"
              />
              <Button type="submit" className="w-full rounded-xl">
                Crear Proyecto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group relative transition-all hover:shadow-xl hover:-translate-y-1 rounded-2xl border-none shadow-sm bg-card/50 backdrop-blur-sm"
          >
            <Link href={`/dashboard/projects/${project.id}`} className="block">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Folder size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">{project.name}</CardTitle>
                  <CardDescription>
                    {project._count?.tasks || 0} tareas en total
                  </CardDescription>
                </div>
              </CardHeader>
            </Link>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm("¿Estás seguro de eliminar este proyecto?")) {
                    deleteProject(project.id);
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-muted/50">
            <div className="flex flex-col items-center gap-4">
              <Folder size={48} className="text-muted/30" />
              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground">
                  No tienes proyectos creados
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Crea tu primer proyecto para empezar a organizar tus tareas.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setNewProjectOpen(true)}
                className="rounded-xl mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Crear mi primer proyecto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

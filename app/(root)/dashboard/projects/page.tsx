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
import { Folder, Plus, MoreVertical, Trash2, Search, Target, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ProjectCard({
  project,
  onDelete,
  tasks = [],
}: {
  project: any;
  onDelete: (id: string) => void;
  tasks?: any[];
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="group relative transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 rounded-[2.5rem] border border-border/10 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <Link href={`/dashboard/projects/${project.id}`} className="block p-7">
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Folder size={32} />
          </div>
          <div className="flex flex-col items-end gap-2">
            {project.completed && (
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                Completado
              </Badge>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground/40 font-bold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
              Activo
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1 mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <Target size={12} className="text-primary/70" />
                {totalTasks} Tareas
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500/70" />
                {completedTasks} Listas
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                Progreso General
              </p>
              <p className="text-xs font-black text-primary">
                {Math.round(progress)}%
              </p>
            </div>
            <Progress value={progress} className="h-2 rounded-full bg-primary/5 shadow-inner" />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border/5">
            <div className="flex -space-x-3">
              {project.collaborators?.slice(0, 4).map((c: any, i: number) => (
                <div
                  key={c.id}
                  className="h-9 w-9 rounded-2xl border-4 border-card overflow-hidden shadow-lg transform transition-transform group-hover:-translate-y-1"
                  style={{ zIndex: 4 - i, transitionDelay: `${i * 50}ms` }}
                >
                  <img
                    src={
                      c.user.image || `https://avatar.vercel.sh/${c.user.email}`
                    }
                    className="h-full w-full object-cover"
                    alt={c.user.name}
                  />
                </div>
              ))}
              {project.collaborators?.length > 4 && (
                <div className="h-9 w-9 rounded-2xl bg-muted text-[10px] font-black flex items-center justify-center border-4 border-card text-muted-foreground z-0 shadow-lg transform group-hover:-translate-y-1 transition-transform">
                  +{project.collaborators.length - 4}
                </div>
              )}
              {(!project.collaborators ||
                project.collaborators.length === 0) && (
                <div className="h-9 w-9 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center transform group-hover:-translate-y-1 transition-transform">
                  <Plus size={14} className="text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="px-4 py-2 rounded-xl bg-primary/5 text-[10px] font-black text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              Ver Detalles
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.preventDefault();
            setIsDeleteOpen(true);
          }}
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <Trash2 size={32} />
            </div>
            <DialogTitle className="text-2xl font-black">
              ¿Eliminar proyecto?
            </DialogTitle>
            <DialogDescription className="py-2 text-base text-muted-foreground">
              Estás a punto de borrar <strong>"{project.name}"</strong>. Esta
              acción es irreversible y eliminará todas las tareas asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-2xl px-6 h-12 font-bold"
            >
              No, cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(project.id);
                setIsDeleteOpen(false);
              }}
              className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-destructive/20"
            >
              Sí, eliminar ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function ProjectsPage() {
  const { projects, tasks, deleteProject, addProject, fetchProjects, fetchTasks } = useTaskStore();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await addProject({ name: projectName });
    setProjectName("");
    setNewProjectOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter">Mis Proyectos</h1>
          <p className="text-muted-foreground font-medium pl-1 border-l-4 border-primary/40 text-lg">
            Gestiona y organiza tus flujos de trabajo por categorías.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
            <Input
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-none bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium transition-all"
            />
          </div>

          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto rounded-2xl h-14 px-10 shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 transition-all active:scale-95">
                <Plus className="mr-2 h-6 w-6" /> Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm border border-primary/5">
                <Plus size={28} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">
                Crear Proyecto
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground py-2">
                Asigna un nombre para tu nuevo espacio de trabajo. Podrás
                invitar a tu equipo más tarde.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">
                  Nombre del Proyecto
                </label>
                <Input
                  placeholder="Ej: Rediseño Web, Campaña 2026..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                  className="rounded-2xl h-14 px-6 text-lg border-border/10 bg-muted/30 focus:bg-background transition-all"
                />
              </div>
              <DialogFooter className="sm:justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNewProjectOpen(false)}
                  className="rounded-2xl h-12 px-6 font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!projectName.trim()}
                  className="rounded-2xl h-12 px-10 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              tasks={tasks.filter((t) => t.projectId === project.id)}
            />
          ))
        ) : (
          <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-6 bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/10 group">
            <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700">
              {searchQuery ? <Search size={48} /> : <Folder size={48} />}
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-muted-foreground tracking-tight">
                {searchQuery
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : "Aún no tienes proyectos"}
              </p>
              <p className="text-sm text-muted-foreground/50 mt-1 uppercase tracking-widest font-bold">
                {searchQuery
                  ? "Intenta con otro nombre o borra el filtro"
                  : "Empieza creando uno arriba"}
              </p>
              {searchQuery && (
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 font-black uppercase tracking-widest text-[10px] text-primary"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

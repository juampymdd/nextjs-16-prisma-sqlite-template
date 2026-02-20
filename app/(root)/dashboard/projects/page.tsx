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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
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

function ProjectCard({ project, onDelete }: { project: any; onDelete: (id: string) => void }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <Card className="group relative transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 rounded-[2.5rem] border border-border/10 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <Link href={`/dashboard/projects/${project.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-500">
            <Folder size={28} />
          </div>
          <div className="flex gap-2">
            {project.completed && (
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                Cerrado
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest mt-1">
              {project._count?.tasks || 0} tareas en total
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/5">
            <div className="flex -space-x-2">
              {project.collaborators?.slice(0, 3).map((c: any, i: number) => (
                <div
                  key={c.id}
                  className="h-8 w-8 rounded-full border-2 border-background overflow-hidden shadow-sm"
                  style={{ zIndex: 3 - i }}
                >
                  <img
                    src={c.user.image || `https://avatar.vercel.sh/${c.user.email}`}
                    className="h-full w-full object-cover"
                    alt={c.user.name}
                  />
                </div>
              ))}
              {project.collaborators?.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted text-[10px] font-black flex items-center justify-center border-2 border-background text-muted-foreground z-0 shadow-sm">
                  +{project.collaborators.length - 3}
                </div>
              )}
              {(!project.collaborators || project.collaborators.length === 0) && (
                <div className="h-8 w-8 rounded-full bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <Plus size={12} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
              Ver Proyecto →
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
            <DialogTitle className="text-2xl font-black">¿Eliminar proyecto?</DialogTitle>
            <DialogDescription className="py-2 text-base text-muted-foreground">
              Estás a punto de borrar <strong>"{project.name}"</strong>. Esta acción es irreversible y eliminará todas las tareas asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:justify-end mt-6">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-2xl px-6 h-12 font-bold">
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
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Mis Proyectos</h1>
          <p className="text-muted-foreground font-medium pl-1 border-l-2 border-primary/20">
            Gestiona y organiza tus flujos de trabajo por categorías.
          </p>
        </div>
        <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-[1.5rem] h-12 px-8 shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 transition-all active:scale-95">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm border border-primary/5">
                <Plus size={28} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">Crear Proyecto</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground py-2">
                Asigna un nombre para tu nuevo espacio de trabajo. Podrás invitar a tu equipo más tarde.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
            />
          ))
        ) : (
          <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-6 bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/10 group">
            <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700">
              <Folder size={48} />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-muted-foreground tracking-tight">Aún no tienes proyectos</p>
              <p className="text-sm text-muted-foreground/50 mt-1 uppercase tracking-widest font-bold">Empieza creando uno arriba</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

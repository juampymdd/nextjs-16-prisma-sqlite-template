"use client";

import { useState } from "react";
import { useTaskStore, Project } from "@/libs/store/useTaskStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserMinus, UserPlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface CollaboratorManagerProps {
  project: Project;
}

export function CollaboratorManager({ project }: CollaboratorManagerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const { searchUsers, addProjectCollaborator, removeProjectCollaborator } =
    useTaskStore();

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const users = await searchUsers(val);
    setResults(users);
    setIsSearching(false);
  };

  const handleAdd = async (userId: string) => {
    try {
      await addProjectCollaborator(project.id, userId);
      toast.success("Colaborador añadido correctamente");
      setQuery("");
      setResults([]);
    } catch (error: any) {
      toast.error(error.message || "No se pudo añadir al colaborador");
    }
  };

  const handleRemoveClick = (userId: string) => {
    setUserToRemove(userId);
    setIsConfirmRemoveOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (userToRemove) {
      await removeProjectCollaborator(project.id, userToRemove);
      toast.success("Colaborador eliminado");
      setIsConfirmRemoveOpen(false);
      setUserToRemove(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-2xl h-11 px-5 flex items-center gap-3 bg-muted/30 hover:bg-primary/10 hover:text-primary border border-border/10 transition-all duration-300 shadow-sm group"
        >
          <Users
            size={18}
            className="text-muted-foreground group-hover:scale-110 transition-transform"
          />
          <span className="font-bold text-sm">Equipo</span>
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex -space-x-2 ml-1">
              {project.collaborators.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  className="h-6 w-6 rounded-full border-2 border-background overflow-hidden"
                  style={{ zIndex: 3 - i }}
                >
                  <img
                    src={
                      c.user.image || `https://avatar.vercel.sh/${c.user.email}`
                    }
                    className="h-full w-full object-cover"
                    alt=""
                  />
                </div>
              ))}
              {project.collaborators.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] font-black flex items-center justify-center border-2 border-background text-primary">
                  +{project.collaborators.length - 3}
                </div>
              )}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none" />
          <div className="relative p-8 pb-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4 text-foreground">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary transform group-hover:rotate-12 transition-transform duration-500">
                  <Users size={32} />
                </div>
                Equipo del Proyecto
              </DialogTitle>
            </DialogHeader>
            <p className="mt-4 text-muted-foreground text-sm font-medium leading-relaxed">
              Gestiona quiénes tienen acceso a este proyecto y colaboran en las
              tareas.
            </p>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-8">
          {/* Search section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
              Añadir Miembros
            </h3>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              </div>
              <Input
                placeholder="Buscar por nombre o email..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-11 h-14 rounded-2xl bg-muted/40 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-offset-0 focus-visible:ring-0 transition-all font-semibold placeholder:font-medium placeholder:text-muted-foreground/40"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="bg-muted/30 rounded-[2rem] border border-border/10 overflow-hidden divide-y divide-border/5 animate-in fade-in slide-in-from-top-2 duration-300">
                {results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 hover:bg-primary/[0.03] transition-colors group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-background shadow-md">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-black uppercase">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight leading-tight">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                      onClick={() => handleAdd(user.id)}
                    >
                      <UserPlus size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
              Miembros Actuales
            </h3>
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between p-4 bg-primary/[0.02] rounded-[2rem] border border-primary/5 shadow-inner">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                    <AvatarImage src={project.user?.image} />
                    <AvatarFallback className="bg-orange-500/10 text-orange-500 text-sm font-black uppercase">
                      {project.user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black tracking-tight">
                        {project.user?.name || "Propietario"}
                      </span>
                      <div className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                        Owner
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Propietario del proyecto
                    </span>
                  </div>
                </div>
              </div>

              {/* Collaborators */}
              <div className="grid gap-2">
                {project.collaborators?.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-all duration-300 rounded-[2rem] border border-transparent hover:border-border/10 group/collab"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-500">
                        <AvatarImage src={collab.user.image} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-black uppercase">
                          {collab.user.name?.charAt(0) ||
                            collab.user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">
                          {collab.user.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {collab.user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => handleRemoveClick(collab.user.id)}
                    >
                      <UserMinus size={18} />
                    </Button>
                  </div>
                ))}
              </div>

              {(!project.collaborators ||
                project.collaborators.length === 0) && (
                <div className="py-12 flex flex-col items-center justify-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/10 space-y-3 group/empty">
                  <div className="bg-muted-foreground/5 p-4 rounded-full group-hover:scale-110 transition-transform duration-500">
                    <Users size={24} className="text-muted-foreground/30" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 font-black uppercase tracking-widest">
                    Sin colaboradores externos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>¿Eliminar colaborador?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar a este colaborador del
              proyecto? Ya no tendrá acceso a las tareas asociadas.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmRemoveOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              className="rounded-xl font-bold px-6"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

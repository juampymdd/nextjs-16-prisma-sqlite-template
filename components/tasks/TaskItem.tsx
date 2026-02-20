"use client";

import { useTaskStore, Task } from "@/libs/store/useTaskStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Trash2,
  Calendar,
  AlertCircle,
  ListChecks,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Users,
  Pencil,
  Search,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TaskDetailDialog } from "./TaskDetailDialog"; // Use Detail Dialog instead of EditForm
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskCountdown } from "./TaskCountdown";
import { format, addMinutes } from "date-fns";

interface TaskItemProps {
  task: Task;
}

const priorityConfig = {
  low: { color: "bg-blue-500/10 text-blue-600 border-blue-200", label: "Baja" },
  medium: {
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    label: "Media",
  },
  high: { color: "bg-red-500/10 text-red-600 border-red-200", label: "Alta" },
};

export const TaskItem = ({ task }: TaskItemProps) => {
  const {
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addCollaborator,
    searchUsers,
  } = useTaskStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleConfirmDelete = async () => {
    await deleteTask(task.id);
    setIsConfirmDeleteOpen(false);
  };

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!task.project) return;

    // Filter project members
    const members = [
      { id: task.project.userId, ...task.project.user },
      ...(task.project.collaborators || []).map((c: any) => ({
        id: c.userId,
        ...c.user,
      })),
    ].filter((m) => m.id); // Ensure user object exists

    const filtered = members.filter(
      (m) =>
        m.name?.toLowerCase().includes(val.toLowerCase()) ||
        m.email?.toLowerCase().includes(val.toLowerCase()),
    );
    setResults(filtered);
  };

  const handleAddCollaborator = async (email: string) => {
    try {
      await addCollaborator(task.id, email);
      toast.success("Usuario invitado correctamente");
      setQuery("");
      setResults([]);
    } catch (e: any) {
      toast.error(e.message || "No se pudo invitar al usuario");
    }
  };

  return (
    <Card
      className={`group transition-all duration-300 rounded-2xl border-border/40 hover:shadow-md cursor-pointer ${
        task.completed ? "bg-muted/30 opacity-75" : "bg-card"
      }`}
      onClick={() => setIsDetailOpen(true)}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={(checked) =>
            updateTask(task.id, { completed: !!checked })
          }
          className="w-6 h-6 rounded-full border-2"
          onClick={(e) => e.stopPropagation()} // Prevent opening dialog when clicking checkbox
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-bold text-lg truncate ${
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
            {task.priority && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityConfig[task.priority as keyof typeof priorityConfig].color}`}
              >
                {
                  priorityConfig[task.priority as keyof typeof priorityConfig]
                    .label
                }
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {task.description.replace(/<[^>]*>?/gm, "")}{" "}
              {/* Strip HTML for preview */}
            </p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
              <Calendar size={10} />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${
                    new Date(task.dueDate) < new Date() && !task.completed
                      ? "text-red-500"
                      : "text-muted-foreground/60"
                  }`}
                >
                  <AlertCircle size={10} />
                  Vence:{" "}
                  {format(
                    addMinutes(
                      new Date(task.dueDate),
                      new Date().getTimezoneOffset(),
                    ),
                    "dd/MM/yyyy",
                  )}
                </div>
                <TaskCountdown
                  dueDate={task.dueDate}
                  completed={task.completed}
                />
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                <ListChecks size={10} />
                {task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length} pasos
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.image} />
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                    {task.assignee.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {task.assignee.name}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted rounded-xl"
            title="Editar tarea"
            onClick={() => setIsDetailOpen(true)}
          >
            <Pencil size={18} />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted rounded-xl"
              >
                <UserPlus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-none shadow-2xl sm:max-w-md p-0 overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-border/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">
                    Colaboradores
                  </DialogTitle>
                  <DialogDescription>
                    Busca e invita a otros miembros a esta tarea.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Nombre o email para invitar..."
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>

                  {results.length > 0 && (
                    <div className="bg-muted/30 rounded-2xl border border-border/10 overflow-hidden divide-y divide-border/5 animate-in fade-in zoom-in-95 duration-200">
                      {results.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage src={user.image} />
                              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                                {user.name?.[0] || user.email?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">
                                {user.name || "Sin nombre"}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg h-8 w-8 p-0"
                            onClick={() => handleAddCollaborator(user.email)}
                            disabled={task.collaborators?.some(
                              (c) => c.userId === user.id,
                            )}
                          >
                            <UserPlus size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1">
                    Equipo asignado
                  </h4>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {task.collaborators?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/40">
                        <Users
                          className="text-muted-foreground/40 mb-2"
                          size={24}
                        />
                        <p className="text-xs text-muted-foreground">
                          No hay colaboradores asignados aún.
                        </p>
                      </div>
                    )}
                    {task.collaborators?.map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 p-3 bg-card border border-border/40 rounded-2xl group/collab transition-colors hover:bg-muted/30"
                      >
                        <Avatar className="h-10 w-10 rounded-xl">
                          <AvatarImage src={c.user.image} />
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-sm font-bold">
                            {c.user.name?.[0] || c.user.email?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black truncate">
                            {c.user.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {c.user.email}
                          </p>
                        </div>
                        <div className="text-[10px] font-black bg-muted rounded-lg px-2 py-1 uppercase text-muted-foreground">
                          Editor
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:bg-muted rounded-xl"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
            onClick={() => setIsConfirmDeleteOpen(true)}
          >
            <Trash2 size={18} />
          </Button>

          <Dialog
            open={isConfirmDeleteOpen}
            onOpenChange={setIsConfirmDeleteOpen}
          >
            <DialogContent className="sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>¿Eliminar tarea?</DialogTitle>
                <DialogDescription className="py-2">
                  Estás a punto de eliminar la tarea{" "}
                  <strong>"{task.title}"</strong>. Esta acción no se puede
                  deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="rounded-xl font-bold"
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <TaskDetailDialog
        task={task}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-border/10 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3 mt-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
              Subtareas / Checklist
            </h4>
            <div className="space-y-2">
              {task.subtasks?.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 group/sub"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    className="w-4 h-4 rounded-md"
                  />
                  <span
                    className={`text-sm flex-1 ${subtask.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem(
                  "subtaskTitle",
                ) as HTMLInputElement;
                if (input.value.trim()) {
                  addSubtask(task.id, input.value.trim());
                  input.value = "";
                }
              }}
              className="flex gap-2 mt-4"
            >
              <Input
                name="subtaskTitle"
                placeholder="Nueva subtarea..."
                className="h-9 text-sm rounded-xl border-border/40"
              />
              <Button type="submit" size="sm" className="h-9 rounded-xl px-4">
                Añadir
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress"; // Need to check if this exists
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Flag,
  ChevronRight,
  Loader2,
  Paperclip,
  X,
  Layout,
  Folder,
  Users,
  Search,
  UserPlus,
  Maximize2,
  ChevronLeft,
  Download,
  AlignLeft,
  ListChecks,
  Check,
  CloudUpload,
  MessageSquare,
} from "lucide-react";
import {
  useTaskStore,
  Task,
  TaskStatus,
  Priority,
  Comment,
} from "@/libs/store/useTaskStore";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/libs/utils";
import { format, addMinutes, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { TaskCountdown } from "./TaskCountdown";
import { useEffect } from "react";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task: taskProp,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const {
    tasks,
    updateTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    projects,
    addAttachment,
    deleteAttachment,
    addCollaborator,
    searchUsers,
    addComment,
    fetchComments,
  } = useTaskStore();

  const [localDescription, setLocalDescription] = useState(
    taskProp.description || "",
  );
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const task = useMemo(() => {
    return tasks.find((t) => t.id === taskProp.id) || taskProp;
  }, [tasks, taskProp.id, taskProp]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === task.projectId);
  }, [projects, task.projectId]);

  const currentProject = selectedProject;

  useEffect(() => {
    if (open && task.id) {
      fetchComments(task.id);
    }
  }, [open, task.id, fetchComments]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!currentProject) return;

    // Filter project members
    const members = [
      { ...currentProject.user, id: currentProject.userId },
      ...currentProject.collaborators.map((c) => ({ ...c.user, id: c.userId })),
    ];

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

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const completionPercentage = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === "DONE" ? 100 : 0;
    }
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }, [task.subtasks, task.status]);

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      await updateTask(task.id, { status });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handlePriorityChange = async (priority: Priority) => {
    try {
      await updateTask(task.id, { priority });
      toast.success("Prioridad actualizada");
    } catch (error) {
      toast.error("Error al actualizar prioridad");
    }
  };

  const handleProjectChange = async (projectId: string) => {
    try {
      await updateTask(task.id, { projectId });
      toast.success("Proyecto actualizado");
    } catch (error) {
      toast.error("Error al actualizar proyecto");
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await updateTask(task.id, {
        assigneeId: assigneeId === "none" ? undefined : assigneeId,
      });
      toast.success("Asignado actualizado");
    } catch (error) {
      toast.error("Error al actualizar asignado");
    }
  };

  const handleDueDateChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      await updateTask(task.id, { dueDate: e.target.value });
      toast.success("Vencimiento actualizado");
    } catch (error) {
      toast.error("Error al actualizar vencimiento");
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setIsAddingSubtask(true);
    try {
      await addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle("");
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleDescriptionChange = (content: string) => {
    setLocalDescription(content);
  };

  const saveDescription = async () => {
    setIsUpdatingDescription(true);
    try {
      await updateTask(task.id, { description: localDescription });
      toast.success("Descripción guardada");
    } finally {
      setIsUpdatingDescription(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addComment(task.id, newComment.trim());
      setNewComment("");
      toast.success("Comentario añadido");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube solo imágenes");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        await addAttachment(task.id, {
          url: base64,
          name: file.name,
          type: "image",
        });
        toast.success("Imagen subida correctamente");
      } catch (error) {
        toast.error("Error al subir la imagen");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Detalles de la tarea {task.title}
          </DialogDescription>
        </DialogHeader>
        <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                task.priority === "high"
                  ? "bg-red-500/10 text-red-500"
                  : task.priority === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-blue-500/10 text-blue-500",
                "border-none capitalize px-3",
              )}
            >
              <Flag className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
              {currentProject?.name || "Sin Proyecto"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-4 mr-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap font-black uppercase tracking-widest">
                  <Calendar className="h-3.5 w-3.5" />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Header & Progress */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {task.title}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  <Folder className="h-3 w-3" />
                  <span>{currentProject?.name || "Sin Proyecto"}</span>
                  <span>•</span>
                  <span>
                    Creada el {format(new Date(task.createdAt), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary drop-shadow-sm">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
                  Progreso Total
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden p-[2px] border border-border/5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* QUICK CONFIG BAR (HORIZONTAL) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/10">
              {/* Project */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                  Proyecto
                </label>
                <Select
                  value={task.projectId}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="h-9 rounded-xl border-none bg-background/50 hover:bg-background transition-colors text-xs font-semibold shadow-sm">
                    <SelectValue placeholder="Proyecto" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                  Estado
                </label>
                <Select
                  value={task.status}
                  onValueChange={(val) => handleStatusChange(val as TaskStatus)}
                >
                  <SelectTrigger className="h-9 rounded-xl border-none bg-background/50 hover:bg-background transition-colors text-xs font-semibold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="TODO" className="text-xs">
                      Para Hacer
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-xs">
                      En Proceso
                    </SelectItem>
                    <SelectItem value="DONE" className="text-xs">
                      Finalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                  Prioridad
                </label>
                <Select
                  value={task.priority}
                  onValueChange={(val) => handlePriorityChange(val as Priority)}
                >
                  <SelectTrigger className="h-9 rounded-xl border-none bg-background/50 hover:bg-background transition-colors text-xs font-semibold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="low" className="text-xs">
                      Baja
                    </SelectItem>
                    <SelectItem value="medium" className="text-xs">
                      Media
                    </SelectItem>
                    <SelectItem value="high" className="text-xs">
                      Alta
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                  Asignado
                </label>
                <Select
                  value={task.assigneeId || "none"}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="h-9 rounded-xl border-none bg-background/50 hover:bg-background transition-colors text-xs font-semibold shadow-sm">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="none" className="text-xs">
                      Sin asignar
                    </SelectItem>
                    {selectedProject?.user && (
                      <SelectItem
                        value={selectedProject.user.id}
                        className="text-xs"
                      >
                        {selectedProject.user.name} (Tú)
                      </SelectItem>
                    )}
                    {selectedProject?.collaborators?.map((collab) => (
                      <SelectItem
                        key={collab.user.id}
                        value={collab.user.id}
                        className="text-xs"
                      >
                        {collab.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">
                  Vencimiento
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={
                      task.dueDate
                        ? new Date(task.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleDueDateChange}
                    className="h-9 rounded-xl border-none bg-background/50 hover:bg-background transition-colors text-xs font-semibold shadow-sm pr-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Description - FULL WIDTH */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <AlignLeft className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Descripción del Proyecto
                  </h3>
                </div>
                {isUpdatingDescription && (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                )}
              </div>

              <div className="rounded-2xl border border-border/10 bg-muted/5 p-1 focus-within:border-primary/30 transition-colors">
                <TiptapEditor
                  content={localDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Escribe los detalles maestros de esta tarea..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl px-6 bg-background shadow-sm border-border/10 hover:border-primary/50 transition-all font-bold text-xs"
                  onClick={saveDescription}
                  disabled={
                    isUpdatingDescription ||
                    localDescription === task.description
                  }
                >
                  {isUpdatingDescription
                    ? "Guardando..."
                    : "Sincronizar Cambios"}
                </Button>
              </div>
            </div>

            {/* Subtasks - REORGANIZED FOR BETTER UX */}
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                      Subtareas Operativas
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {task.subtasks?.filter((s) => s.completed).length} de{" "}
                      {task.subtasks?.length} completadas
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {/* Team visual feedback */}
                  {task.collaborators?.slice(0, 3).map((c: any) => (
                    <Avatar
                      key={c.id}
                      className="h-6 w-6 border-2 border-background shadow-sm"
                    >
                      <AvatarImage src={c.user.image} />
                      <AvatarFallback className="text-[8px] font-black">
                        {c.user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.collaborators && task.collaborators.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-black">
                      +{task.collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {task.subtasks?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group",
                      subtask.completed
                        ? "bg-green-500/5 border-green-500/20 opacity-80"
                        : "bg-background border-border/10 hover:border-primary/40 hover:shadow-md",
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleSubtask(task.id, subtask.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
                          subtask.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-muted-foreground/30 hover:border-primary text-transparent",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <span
                        className={cn(
                          "text-sm font-semibold transition-all",
                          subtask.completed &&
                            "line-through text-muted-foreground/60",
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      onClick={() => deleteSubtask(task.id, subtask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <form
                  onSubmit={handleAddSubtask}
                  className="md:col-span-2 relative mt-2 group"
                >
                  <Input
                    placeholder="¿Cuál es el siguiente paso?"
                    className="h-14 pl-5 pr-14 rounded-2xl bg-muted/20 border-border/10 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    disabled={isAddingSubtask}
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                  >
                    {isAddingSubtask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Attachments - REFINED GRID */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Recursos Visuales
                  </h3>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all">
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {isUploading ? "Procesando..." : "Subir Imagen"}
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {task.attachments?.map((attachment, index) => (
                  <div
                    key={attachment.id}
                    className="group relative aspect-square rounded-2xl border-none overflow-hidden bg-muted/30 cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-300"
                    onClick={() => setGalleryIndex(index)}
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryIndex(index);
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-9 h-9 rounded-xl shadow-lg border-none"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await deleteAttachment(task.id, attachment.id);
                            toast.success("Imagen eliminada");
                          } catch (error) {
                            toast.error("Error");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <label className="group border-2 border-dashed border-border/20 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-muted-foreground/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-300 aspect-square cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <CloudUpload className="h-6 w-6" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Añadir Archivo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* Team / Collaborators Section - INTEGRATED */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    Asignados a esta tarea
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex -space-x-3">
                  {task.collaborators?.map((c: any) => (
                    <div key={c.id} className="relative group">
                      <Avatar className="h-12 w-12 border-4 border-background shadow-xl transform transition-transform group-hover:-translate-y-2">
                        <AvatarImage src={c.user.image} />
                        <AvatarFallback className="text-sm font-black bg-primary/10 text-primary uppercase">
                          {c.user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-[8px] text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {c.user.name}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative group flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Miembros del proyecto..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => handleSearch(query)}
                    className="pl-10 h-11 rounded-2xl bg-background border-none shadow-sm text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </div>

              {results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-4 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {results.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-background rounded-2xl shadow-sm border border-border/5"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-xl">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-[10px] font-bold">
                            {user.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold truncate max-w-[100px]">{user.name}</p>
                          <p className="text-[9px] text-muted-foreground truncate max-w-[100px]">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground"
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

            {/* Comments Section */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                  Comentarios
                </h3>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {task.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
                      <AvatarImage src={comment.user.image} />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">
                        {comment.user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold">{comment.user.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      <div className="p-3 bg-background rounded-2xl rounded-tl-none border border-border/10 text-sm">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
                {(!task.comments || task.comments.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground/40 space-y-2">
                    <MessageSquare size={32} className="mx-auto opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Sin comentarios aún</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 items-end pt-2">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Escribe un comentario..."
                    className="w-full bg-background border-none rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all resize-none h-20 shadow-inner"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleCommentSubmit} 
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="rounded-2xl h-20 w-20 flex-col gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} />
                      Sumar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Image Gallery Modal */}
      <Dialog
        open={galleryIndex !== null}
        onOpenChange={(open) => !open && setGalleryIndex(null)}
      >
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden border-none bg-black/95 flex flex-col items-center justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Galería de Imágenes</DialogTitle>
          {galleryIndex !== null &&
            task.attachments &&
            task.attachments[galleryIndex] && (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Image */}
                <img
                  src={task.attachments[galleryIndex].url}
                  alt={task.attachments[galleryIndex].name}
                  className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
                />

                {/* Top Controls */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                    asChild
                  >
                    <a
                      href={task.attachments[galleryIndex].url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                    onClick={() => setGalleryIndex(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation */}
                {task.attachments.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md transition-all active:scale-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        const prev =
                          (galleryIndex - 1 + task.attachments.length) %
                          task.attachments.length;
                        setGalleryIndex(prev);
                      }}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md transition-all active:scale-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next =
                          (galleryIndex + 1) % task.attachments.length;
                        setGalleryIndex(next);
                      }}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {/* Info Bottom */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                  {galleryIndex + 1} / {task.attachments.length} —{" "}
                  {task.attachments[galleryIndex].name}
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

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
} from "lucide-react";
import {
  useTaskStore,
  Task,
  TaskStatus,
  Priority,
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
import { cn } from "@/libs/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { updateTask, addSubtask, toggleSubtask, deleteSubtask, projects } =
    useTaskStore();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState(
    task.description || "",
  );

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube solo imágenes");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch(`/api/task/${task.id}/attachment`, {
          method: "POST",
          body: JSON.stringify({
            url: base64,
            name: file.name,
            type: "image",
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          toast.success("Imagen subida correctamente");
          // The store should ideally handle updating the task attachments
          // For now, we might need a fetchTask or similar
        }
      } catch (error) {
        toast.error("Error al subir la imagen");
      }
    };
    reader.readAsDataURL(file);
  };

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === task.projectId);
  }, [projects, task.projectId]);

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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-4">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(task.dueDate), "dd MMM, yyyy")}
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
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">
                  {task.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona los detalles, subtareas y adjuntos de esta tarea.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {completionPercentage}%
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Completado
                </div>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-3">
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>Descripción Detallada</span>
                  {isUpdatingDescription && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
                <TiptapEditor
                  content={localDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Describe la tarea, añade notas, enlaces o imágenes..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg shadow-sm"
                    onClick={saveDescription}
                    disabled={
                      isUpdatingDescription ||
                      localDescription === task.description
                    }
                  >
                    {isUpdatingDescription ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Adjuntos
                  </h3>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                      <Plus className="h-4 w-4" /> Subir Imagen
                    </div>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {task.attachments?.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="group relative aspect-video rounded-xl border overflow-hidden bg-muted"
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <label className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-xs font-medium">Añadir Imagen</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Subtasks */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" /> Subtareas
                </h3>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {task.subtasks?.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-card/50 hover:bg-card transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSubtask(task.id, subtask.id)}
                          className={cn(
                            "transition-colors",
                            subtask.completed
                              ? "text-green-500"
                              : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-sm transition-all",
                            subtask.completed &&
                              "line-through text-muted-foreground opacity-70",
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSubtask} className="relative mt-4">
                  <Input
                    placeholder="Nueva subtarea..."
                    className="pr-10 rounded-xl"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    disabled={isAddingSubtask}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 rounded-lg shadow-none"
                    disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                  >
                    {isAddingSubtask ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>

              {/* Configuración Detallada */}
              <div className="rounded-2xl border bg-muted/30 p-6 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  Configuración
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 px-1">
                      <Folder size={12} /> Proyecto
                    </label>
                    <Select
                      value={task.projectId}
                      onValueChange={handleProjectChange}
                    >
                      <SelectTrigger className="h-9 rounded-xl bg-card border-none shadow-sm text-xs">
                        <SelectValue placeholder="Sin proyecto" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {projects.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="text-xs"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 px-1">
                      <Layout size={12} /> Estado
                    </label>
                    <Select
                      value={task.status}
                      onValueChange={(val) =>
                        handleStatusChange(val as TaskStatus)
                      }
                    >
                      <SelectTrigger className="h-9 rounded-xl bg-card border-none shadow-sm text-xs">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl text-xs">
                        <SelectItem value="TODO">Para Hacer</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Proceso</SelectItem>
                        <SelectItem value="DONE">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 px-1">
                      <Flag size={12} /> Prioridad
                    </label>
                    <Select
                      value={task.priority}
                      onValueChange={(val) =>
                        handlePriorityChange(val as Priority)
                      }
                    >
                      <SelectTrigger className="h-9 rounded-xl bg-card border-none shadow-sm text-xs">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl text-xs">
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 px-1">
                      <Calendar size={12} /> Vencimiento
                    </label>
                    <Input
                      type="date"
                      value={
                        task.dueDate
                          ? new Date(task.dueDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={handleDueDateChange}
                      className="h-9 rounded-xl bg-card border-none shadow-sm text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/10">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4">
                    <span>Creada</span>
                    <span className="font-mono">
                      {format(new Date(task.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest hover:underline cursor-pointer group">
                    <Paperclip className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                    Compartir Tarea
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

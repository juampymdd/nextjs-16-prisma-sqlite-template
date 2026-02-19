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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TaskDetailDialog } from "./TaskDetailDialog"; // Use Detail Dialog instead of EditForm

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
  } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
              <div
                className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest ${
                  new Date(task.dueDate) < new Date() && !task.completed
                    ? "text-red-500"
                    : "text-muted-foreground/60"
                }`}
              >
                <AlertCircle size={10} />
                Vence: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                <ListChecks size={10} />
                {task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length} pasos
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
            <DialogContent className="rounded-3xl border-none shadow-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Colaboradores
                </DialogTitle>
                <DialogDescription>
                  Invita a otros usuarios a colaborar en esta tarea.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="flex gap-2">
                  <Input
                    id={`invite-${task.id}`}
                    placeholder="Email del usuario..."
                    className="h-12 rounded-xl border-border/40"
                  />
                  <Button
                    onClick={async () => {
                      const input = document.getElementById(
                        `invite-${task.id}`,
                      ) as HTMLInputElement;
                      const email = input.value;
                      try {
                        await addCollaborator(task.id, email);
                        toast.success("Usuario invitado correctamente");
                        input.value = "";
                      } catch (e: any) {
                        toast.error(
                          e.message || "No se pudo invitar al usuario",
                        );
                      }
                    }}
                    className="h-12 rounded-xl px-6"
                  >
                    Invitar
                  </Button>
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
                        {c.user.image ? (
                          <img
                            src={c.user.image}
                            alt={c.user.name}
                            className="w-10 h-10 rounded-xl"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                            {c.user.name[0]}
                          </div>
                        )}
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
            onClick={() => {
              if (confirm("¿Eliminar esta tarea?")) deleteTask(task.id);
            }}
          >
            <Trash2 size={18} />
          </Button>
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

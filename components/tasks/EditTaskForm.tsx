"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  Loader2,
  Calendar,
  Flag,
  Folder,
  Layout,
  Info,
} from "lucide-react"; // Added icons
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTaskStore, Task } from "@/libs/store/useTaskStore";
import { toast } from "sonner";
import { useState } from "react";
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

const taskSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, "El proyecto es obligatorio"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function EditTaskForm({
  task,
  onSuccess,
}: {
  task: Task;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { updateTask, projects } = useTaskStore();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      projectId: task.projectId,
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    setLoading(true);
    try {
      await updateTask(task.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        projectId: values.projectId,
        dueDate: values.dueDate || undefined,
        completed: values.status === "DONE",
      });

      toast.success("Tarea actualizada correctamente");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Error al actualizar la tarea");
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = form.watch("priority");
  const selectedProject = projects.find(
    (p) => p.id === form.watch("projectId"),
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
        <div className="flex flex-col md:flex-row gap-0 overflow-hidden rounded-3xl border shadow-xl bg-card">
          {/* Main Content Area */}
          <div className="flex-1 p-8 space-y-8 border-r border-border/10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    selectedPriority === "high"
                      ? "bg-red-500/10 text-red-500"
                      : selectedPriority === "medium"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-blue-500/10 text-blue-500",
                    "border-none capitalize px-3",
                  )}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {selectedPriority}
                </Badge>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {selectedProject?.name || "Sin Proyecto"}
                </span>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <Input
                        placeholder="Título de la tarea..."
                        {...field}
                        className="text-3xl font-bold tracking-tight border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description / Editor */}
            <div className="space-y-3">
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Descripción Detallada
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TiptapEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe la tarea, añade notas, enlaces o imágenes..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full md:w-80 bg-muted/20 p-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Configuración
              </h3>

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-muted-foreground px-1 flex items-center gap-2">
                      <Folder size={14} /> Proyecto
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-card border-none shadow-sm">
                          <SelectValue placeholder="Sin proyecto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-muted-foreground px-1 flex items-center gap-2">
                      <Layout size={14} /> Estado
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-card border-none shadow-sm">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="TODO">Para Hacer</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Proceso</SelectItem>
                        <SelectItem value="DONE">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-muted-foreground px-1 flex items-center gap-2">
                      <Flag size={14} /> Prioridad
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-card border-none shadow-sm">
                          <SelectValue placeholder="Prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-muted-foreground px-1 flex items-center gap-2">
                      <Calendar size={14} /> Vencimiento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="rounded-xl bg-card border-none shadow-sm h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 border-t border-border/10">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

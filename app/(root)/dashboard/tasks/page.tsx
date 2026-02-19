"use client";

import { useTaskStore, Subtask } from "@/libs/store/useTaskStore";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import { exportToPDF, exportToExcel } from "@/libs/export-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskItem, CreateTaskForm } from "@/components/tasks";
import { Plus, ListChecks, Search, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const TasksPage = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useHotkeys("n", () => setOpen(true));
  useHotkeys("/", (e) => {
    e.preventDefault();
    document
      .querySelector<HTMLInputElement>('input[placeholder="Buscar tareas..."]')
      ?.focus();
  });

  useEffect(() => {
    setIsClient(true);
    fetchTasks();
  }, [fetchTasks]);

  if (!isClient) return null;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mis Tareas</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <ListChecks size={16} />
            {tasks.filter((t) => !t.completed).length} tareas pendientes
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToPDF(tasks)}
              className="rounded-xl border-border/40"
            >
              <FileDown size={14} className="mr-2" /> PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToExcel(tasks)}
              className="rounded-xl border-border/40"
            >
              <FileDown size={14} className="mr-2" /> Excel
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 flex-1 sm:flex-none">
                <Plus className="mr-2" size={18} />
                Nueva Tarea <span className="ml-2 opacity-50 text-xs">[N]</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Formulario para crear una nueva tarea
                </DialogDescription>
              </DialogHeader>
              <CreateTaskForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-10 border-border/40 h-12"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-[180px] rounded-xl border-border/40 h-12">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-dashed bg-muted/20 border-2 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-bold">Sin tareas aún</h3>
            <p className="text-muted-foreground max-w-[250px]">
              {searchQuery || filterPriority !== "all"
                ? "No hay tareas que coincidan con los filtros."
                : "Empieza a organizar tu día creando tu primera tarea."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;

"use client";

import { useTaskStore, Task, ProjectColumn } from "@/libs/store/useTaskStore";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { SortableTask } from "@/components/kanban/SortableTask";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface KanbanBoardProps {
  tasks: Task[];
  columns: ProjectColumn[];
  projectId: string;
}

export function KanbanBoard({ tasks, columns, projectId }: KanbanBoardProps) {
  const { updateTask, addColumn } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleCreateColumn = async () => {
    if (newColumnName.trim()) {
      await addColumn(projectId, newColumnName.trim());
      setNewColumnName("");
      setIsDialogOpen(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const sortedTasks = [...tasks].sort(
    (a, b) => (a.position || 0) - (b.position || 0),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    // Dragging over another task
    if (isOverATask) {
      const activeTaskObj = tasks.find((t) => t.id === activeId);
      const overTaskObj = tasks.find((t) => t.id === overId);

      if (
        activeTaskObj &&
        overTaskObj &&
        activeTaskObj.columnId !== overTaskObj.columnId
      ) {
        // Find the column this overTask belongs to
        const column = columns.find((c) => c.id === overTaskObj.columnId);
        if (column) {
          updateTask(activeTaskObj.id, {
            columnId: column.id,
            status: column.name === "FINALIZADO" ? "DONE" : "IN_PROGRESS",
            completed: column.name === "FINALIZADO",
          });
        }
      }
    }

    // Dragging over a column
    if (isOverAColumn) {
      const task = tasks.find((t) => t.id === activeId);
      const columnId = overId as string;
      if (task && task.columnId !== columnId) {
        const column = columns.find((c) => c.id === columnId);
        if (column) {
          updateTask(task.id, {
            columnId: column.id,
            status: column.name === "FINALIZADO" ? "DONE" : "IN_PROGRESS",
            completed: column.name === "FINALIZADO",
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 min-h-[700px] items-start">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 items-start">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={sortedTasks.filter((t) => t.columnId === column.id)}
            />
          ))}

          <div className="min-w-[320px] max-w-[320px] pt-[48px]">
            <Button
              variant="ghost"
              className="w-full h-[150px] border-2 border-dashed border-muted-foreground/20 rounded-[2rem] hover:bg-muted/50 transition-all flex flex-col gap-2 group"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                Añadir Tablero
              </span>
            </Button>
          </div>
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-90 scale-105 rotate-1 shadow-2xl transition-all">
                  <SortableTask task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Tablero</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              placeholder="Nombre del tablero (Ej: Pendientes, Revisión...)"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateColumn()}
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateColumn}
              disabled={!newColumnName.trim()}
            >
              Crear Tablero
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

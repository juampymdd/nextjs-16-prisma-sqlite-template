"use client";

import { useTaskStore, TaskStatus, Task } from "@/libs/store/useTaskStore";
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
import { arrayMove } from "@dnd-kit/sortable";

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const { updateTask, setTasks } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  const columns: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "Para Hacer" },
    { status: "IN_PROGRESS", title: "En Proceso" },
    { status: "DONE", title: "Finalizado" },
  ];

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

    if (!isActiveATask) return;

    // Dragging over another task
    if (isActiveATask && isOverATask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        updateTask(activeTask.id, {
          status: overTask.status,
          completed: overTask.status === "DONE",
        });
      }
    }

    // Dragging over a column
    const isOverAColumn =
      overId === "TODO" || overId === "IN_PROGRESS" || overId === "DONE";
    if (isActiveATask && isOverAColumn) {
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== overId) {
        updateTask(task.id, {
          status: overId as TaskStatus,
          completed: overId === "DONE",
        });
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

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (isActiveATask && isOverATask) {
      const activeIndex = sortedTasks.findIndex((t) => t.id === activeId);
      const overIndex = sortedTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        const newTasks = arrayMove(sortedTasks, activeIndex, overIndex);

        // Update positions in store
        const updatedWithPositions = newTasks.map((t, index) => ({
          ...t,
          position: index,
        }));

        // We need a setStoreTasks or similar to update many at once
        // For now, let's just update the specific ones or the whole state
        // I'll add a bulk update to the store if possible

        // Optimistic update of the whole list
        // We need to filter back the global tasks list
        setTasks(updatedWithPositions);

        // Sync positions (this is expensive if many, but let's do it for the moved ones)
        // Ideally we'd have a bulk API
        updatedWithPositions.forEach(async (t, index) => {
          if (
            t.position !==
            sortedTasks.find((oldT) => oldT.id === t.id)?.position
          ) {
            await updateTask(t.id, { position: t.position });
          }
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={sortedTasks.filter((t) => t.status === col.status)}
          />
        ))}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 scale-105 transition-transform">
                <SortableTask task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

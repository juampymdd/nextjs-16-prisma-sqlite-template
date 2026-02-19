"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/libs/store/useTaskStore";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function NotificationManager() {
  const { tasks } = useTaskStore();

  useEffect(() => {
    // Request permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (tasks.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      
      const dueSoonTasks = tasks.filter((task) => {
        if (task.completed || !task.dueDate) return false;
        const dueDate = task.dueDate.split("T")[0];
        return dueDate === today;
      });

      if (dueSoonTasks.length > 0) {
        toast.warning(`${dueSoonTasks.length} tareas vencen hoy`, {
          description: "¡No olvides completarlas!",
          icon: <Bell className="text-amber-500" />,
          duration: 10000,
        });

        // Browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("TaskFlow - Recordatorio", {
            body: `Tienes ${dueSoonTasks.length} tareas que vencen hoy.`,
          });
        }
      }
    };

    // Run once after load
    const timer = setTimeout(checkReminders, 2000);
    return () => clearTimeout(timer);
  }, [tasks.length]); // Only run when tasks count changes or on mount

  return null;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type AttachmentType = "image" | "file";

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: AttachmentType;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  _count?: { tasks: number };
}

export interface TaskCollaborator {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string; // Required
  project?: Project;
  position: number;
  dueDate?: string;
  createdAt: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  collaborators: TaskCollaborator[];
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  isLoadingProjects: boolean;

  // Projects
  fetchProjects: () => Promise<void>;
  addProject: (project: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;

  // Tasks (All project-dependent)
  fetchTasks: () => Promise<void>;
  addTask: (task: {
    title: string;
    description?: string;
    priority: Priority;
    projectId: string;
    status: TaskStatus;
    dueDate?: string;
    completed?: boolean;
  }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;

  // Task specific items
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addCollaborator: (taskId: string, email: string) => Promise<void>;
  addAttachment: (
    taskId: string,
    attachment: { url: string; name: string; type: AttachmentType },
  ) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      activeProjectId: null,
      isLoading: false,
      isLoadingProjects: false,

      setActiveProject: (id) => set({ activeProjectId: id }),

      fetchProjects: async () => {
        const { projects } = get();
        if (projects.length === 0) set({ isLoadingProjects: true });

        try {
          const res = await fetch("/api/project");
          if (res.ok) {
            const projects = await res.json();
            set({ projects });
          }
        } finally {
          set({ isLoadingProjects: false });
        }
      },

      addProject: async (projectData) => {
        try {
          const res = await fetch("/api/project", {
            method: "POST",
            body: JSON.stringify(projectData),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newProject = await res.json();
            set((state) => ({ projects: [newProject, ...state.projects] }));
          }
        } catch (error) {
          console.error("Error adding project:", error);
        }
      },

      deleteProject: async (id) => {
        const previousProjects = get().projects;
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
        try {
          const res = await fetch(`/api/project/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();
        } catch (error) {
          set({ projects: previousProjects });
        }
      },

      fetchTasks: async () => {
        const { tasks } = get();
        if (tasks.length === 0) set({ isLoading: true });

        try {
          const res = await fetch("/api/task");
          if (res.ok) {
            const data = await res.json();
            console.log("Tasks fetched successfully:", data.length);
            set({ tasks: data });
          } else {
            const errorText = await res.text();
            console.error(
              "Failed to fetch tasks. Status:",
              res.status,
              "Body:",
              errorText,
            );
            // Optional: parse JSON if possible to log it better
            try {
              const errorData = JSON.parse(errorText);
              console.error("Detailed server error:", errorData);
            } catch (e) {}
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addTask: async (taskData) => {
        try {
          const res = await fetch("/api/task", {
            method: "POST",
            body: JSON.stringify(taskData),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newTask = await res.json();
            set((state) => ({ tasks: [newTask, ...state.tasks] }));
          }
        } catch (error) {
          console.error("Error adding task:", error);
        }
      },

      updateTask: async (id, updates) => {
        // Optimistic update
        const previousTasks = get().tasks;
        const newUpdates = { ...updates };

        // Handle status/completed sync
        if (updates.status === "DONE" && updates.completed === undefined) {
          newUpdates.completed = true;
        } else if (
          updates.status &&
          updates.status !== "DONE" &&
          updates.completed === undefined
        ) {
          newUpdates.completed = false;
        }

        if (newUpdates.completed !== undefined) {
          (newUpdates as any).completedAt = newUpdates.completed
            ? new Date().toISOString()
            : null;
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...newUpdates } : task,
          ),
        }));

        try {
          const res = await fetch(`/api/task/${id}`, {
            method: "PUT",
            body: JSON.stringify(newUpdates), // Send the synced updates
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error();
        } catch (error) {
          set({ tasks: previousTasks }); // Rollback
        }
      },

      deleteTask: async (id) => {
        // Optimistic delete
        const previousTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        try {
          const res = await fetch(`/api/task/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();
        } catch (error) {
          set({ tasks: previousTasks }); // Rollback
        }
      },

      setTasks: (newTasks) => {
        set((state) => {
          // Merge newTasks into state.tasks, replacing matches by ID
          const mergedTasks = state.tasks.map((t) => {
            const updated = newTasks.find((nt) => nt.id === t.id);
            return updated || t;
          });
          return { tasks: mergedTasks };
        });
      },

      addSubtask: async (taskId, title) => {
        try {
          const res = await fetch(`/api/task/${taskId}/subtask`, {
            method: "POST",
            body: JSON.stringify({ title }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newSubtask = await res.json();
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] }
                  : t,
              ),
            }));

            // If task was completed, mark it as incomplete because a new subtask was added
            const updatedTask = get().tasks.find((t) => t.id === taskId);
            if (updatedTask && updatedTask.completed) {
              await get().updateTask(taskId, {
                completed: false,
                status: "IN_PROGRESS",
              });
            }
          }
        } catch (error) {
          console.error("Error adding subtask:", error);
        }
      },

      toggleSubtask: async (taskId, subtaskId) => {
        const previousTasks = get().tasks;
        const task = previousTasks.find((t) => t.id === taskId);
        const subtask = task?.subtasks.find((s) => s.id === subtaskId);
        if (!subtask) return;

        const newCompleted = !subtask.completed;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: newCompleted } : s,
                  ),
                }
              : t,
          ),
        }));

        try {
          const res = await fetch(`/api/task/${taskId}/subtask/${subtaskId}`, {
            method: "PUT",
            body: JSON.stringify({ completed: newCompleted }),
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) throw new Error();

          // After subtask update, check if all subtasks are done
          const updatedTask = get().tasks.find((t) => t.id === taskId);
          if (updatedTask && updatedTask.subtasks.length > 0) {
            const allDone = updatedTask.subtasks.every((s) => s.completed);
            if (allDone && !updatedTask.completed) {
              await get().updateTask(taskId, {
                completed: true,
                status: "DONE",
              });
            } else if (!allDone && updatedTask.completed) {
              await get().updateTask(taskId, {
                completed: false,
                status: "IN_PROGRESS",
              });
            }
          }
        } catch (error) {
          set({ tasks: previousTasks });
        }
      },

      deleteSubtask: async (taskId, subtaskId) => {
        const previousTasks = get().tasks;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
                }
              : t,
          ),
        }));

        try {
          const res = await fetch(`/api/task/${taskId}/subtask/${subtaskId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error();

          // Check for auto-completion after deletion
          const updatedTask = get().tasks.find((t) => t.id === taskId);
          if (
            updatedTask &&
            updatedTask.subtasks.length > 0 &&
            updatedTask.subtasks.every((s) => s.completed)
          ) {
            if (!updatedTask.completed) {
              await get().updateTask(taskId, {
                completed: true,
                status: "DONE",
              });
            }
          }
        } catch (error) {
          set({ tasks: previousTasks });
        }
      },

      addCollaborator: async (taskId, email) => {
        try {
          const res = await fetch(`/api/task/${taskId}/collaborator`, {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newCollaborator = await res.json();
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      collaborators: [
                        ...(t.collaborators || []),
                        newCollaborator,
                      ],
                    }
                  : t,
              ),
            }));
          } else {
            const error = await res.json();
            throw new Error(error.error);
          }
        } catch (error: any) {
          throw error;
        }
      },

      addAttachment: async (taskId, attachment) => {
        try {
          const res = await fetch(`/api/task/${taskId}/attachment`, {
            method: "POST",
            body: JSON.stringify(attachment),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newAttachment = await res.json();
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      attachments: [...(t.attachments || []), newAttachment],
                    }
                  : t,
              ),
            }));
          }
        } catch (error) {
          console.error("Error adding attachment:", error);
        }
      },
    }),
    {
      name: "task-storage",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        tasks: state.tasks,
        projects: state.projects,
      }),
    },
  ),
);

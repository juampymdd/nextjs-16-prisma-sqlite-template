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

export interface ProjectCollaborator {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface ProjectColumn {
  id: string;
  name: string;
  color?: string;
  position: number;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  userId: string;
  user?: { id: string; name: string; email: string; image?: string };
  collaborators: ProjectCollaborator[];
  columns: ProjectColumn[];
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
  columnId?: string;
  column?: ProjectColumn;
  position: number;
  dueDate?: string;
  createdAt: string;
  userId: string;
  user?: { id: string; name: string; email: string; image?: string };
  assigneeId?: string;
  assignee?: { id: string; name: string; email: string; image?: string };
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
  fetchProject: (id: string) => Promise<void>;
  addProject: (project: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;

  // Columns
  addColumn: (projectId: string, name: string, color?: string) => Promise<void>;
  updateColumn: (
    projectId: string,
    columnId: string,
    updates: Partial<ProjectColumn>,
  ) => Promise<void>;
  deleteColumn: (projectId: string, columnId: string) => Promise<void>;

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
    assigneeId?: string;
  }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;

  // Collaborators
  searchUsers: (query: string) => Promise<any[]>;
  addProjectCollaborator: (projectId: string, userId: string) => Promise<void>;
  removeProjectCollaborator: (
    projectId: string,
    userId: string,
  ) => Promise<void>;

  // Task specific items
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addCollaborator: (taskId: string, email: string) => Promise<void>;
  addAttachment: (
    taskId: string,
    attachment: { url: string; name: string; type: AttachmentType },
  ) => Promise<void>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
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

      addColumn: async (projectId: string, name: string, color?: string) => {
        try {
          const res = await fetch(`/api/project/${projectId}/column`, {
            method: "POST",
            body: JSON.stringify({ name, color }),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const newColumn = await res.json();
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId
                  ? { ...p, columns: [...(p.columns || []), newColumn] }
                  : p,
              ),
            }));
          }
        } catch (error) {
          console.error("Error adding column:", error);
        }
      },

      updateColumn: async (projectId, columnId, updates) => {
        try {
          const res = await fetch(
            `/api/project/${projectId}/column/${columnId}`,
            {
              method: "PUT",
              body: JSON.stringify(updates),
              headers: { "Content-Type": "application/json" },
            },
          );
          if (res.ok) {
            const updatedColumn = await res.json();
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      columns: p.columns.map((c) =>
                        c.id === columnId ? updatedColumn : c,
                      ),
                    }
                  : p,
              ),
            }));
          }
        } catch (error) {
          console.error("Error updating column:", error);
        }
      },

      deleteColumn: async (projectId, columnId) => {
        try {
          const res = await fetch(
            `/api/project/${projectId}/column/${columnId}`,
            {
              method: "DELETE",
            },
          );
          if (res.ok) {
            // Find fallback column for moving tasks in local state
            const project = get().projects.find((p) => p.id === projectId);
            const fallbackColumn = project?.columns.find(
              (c) => c.id !== columnId,
            );

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      columns: p.columns.filter((c) => c.id !== columnId),
                    }
                  : p,
              ),
              tasks: state.tasks.map((t) =>
                t.columnId === columnId
                  ? { ...t, columnId: fallbackColumn?.id || undefined }
                  : t,
              ),
            }));
          }
        } catch (error) {
          console.error("Error deleting column:", error);
        }
      },

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

      updateProject: async (id: string, updates: Partial<Project>) => {
        try {
          const res = await fetch(`/api/project/${id}`, {
            method: "PUT",
            body: JSON.stringify(updates),
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const updatedProject = await res.json();
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? updatedProject : p,
              ),
            }));
          }
        } catch (error) {
          console.error("Error updating project:", error);
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

      fetchProject: async (id: string) => {
        try {
          const res = await fetch(`/api/project/${id}`);
          if (res.ok) {
            const project = await res.json();
            set((state) => ({
              projects: state.projects.map((p) => (p.id === id ? project : p)),
            }));
            // If project not in store, add it
            if (!get().projects.find((p) => p.id === id)) {
              set((state) => ({ projects: [...state.projects, project] }));
            }
          }
        } catch (error) {
          console.error("Error fetching project:", error);
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

      searchUsers: async (query: string) => {
        if (query.length < 3) return [];
        try {
          const response = await fetch(
            `/api/users?query=${encodeURIComponent(query)}`,
          );
          if (!response.ok) throw new Error("Search failed");
          return await response.json();
        } catch (error) {
          console.error("Search error:", error);
          return [];
        }
      },

      addProjectCollaborator: async (projectId: string, userId: string) => {
        try {
          const response = await fetch(
            `/api/project/${projectId}/collaborator`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            },
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to add collaborator");
          }
          const newCollaborator = await response.json();

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    collaborators: [
                      ...(p.collaborators || []),
                      newCollaborator,
                    ],
                  }
                : p,
            ),
          }));
        } catch (error: any) {
          console.error("Add collaborator error:", error);
          throw error;
        }
      },

      removeProjectCollaborator: async (projectId: string, userId: string) => {
        try {
          const response = await fetch(
            `/api/project/${projectId}/collaborator?userId=${userId}`,
            { method: "DELETE" },
          );
          if (!response.ok) throw new Error("Failed to remove collaborator");

          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    collaborators: (p.collaborators || []).filter(
                      (c) => c.userId !== userId,
                    ),
                  }
                : p,
            ),
          }));
        } catch (error) {
          console.error("Remove collaborator error:", error);
        }
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

      deleteAttachment: async (taskId, attachmentId) => {
        try {
          const res = await fetch(
            `/api/task/${taskId}/attachment/${attachmentId}`,
            {
              method: "DELETE",
            },
          );
          if (res.ok) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      attachments: t.attachments.filter(
                        (a) => a.id !== attachmentId,
                      ),
                    }
                  : t,
              ),
            }));
          }
        } catch (error) {
          console.error("Error deleting attachment:", error);
        }
      },
    }),
    {
      name: "task-storage",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Columns,
  Folder,
  Plus,
  Briefcase,
  Users,
} from "lucide-react";
import { authClient } from "@/app/libs/auth-client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/libs/utils";
import { useTheme } from "next-themes";
import { useTaskStore } from "@/libs/store/useTaskStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Briefcase, label: "Mis Proyectos", href: "/dashboard/projects" },
  { icon: Columns, label: "Tablero Global", href: "/dashboard/board" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { projects, fetchProjects, addProject } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
    if (window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    await addProject({ name: projectName });
    setProjectName("");
    setNewProjectOpen(false);
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  if (!mounted) {
    return (
      <div className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 transform lg:translate-x-0 shadow-2xl lg:shadow-none -translate-x-full" />
    );
  }

  return (
    <>
      {/* Mobile Trigger */}
      <button
        className={cn(
          "lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-xl shadow-sm transition-all",
          isOpen
            ? "left-[208px] border-none bg-transparent text-white"
            : "left-4",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 transform lg:translate-x-0 shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="text-primary-foreground" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-1 custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Proyectos
                </h3>
                <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Proyecto</DialogTitle>
                      <DialogDescription>
                        Asigna un nombre a tu nuevo espacio de trabajo.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateProject}
                      className="space-y-4 pt-4"
                    >
                      <Input
                        placeholder="Nombre del proyecto"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        autoFocus
                      />
                      <Button type="submit" className="w-full">
                        Crear Proyecto
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-1">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-colors group",
                      pathname === `/dashboard/projects/${project.id}`
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {project.userId !== session?.user?.id ||
                      (project.collaborators?.length ?? 0) > 0 ? (
                        <Users size={16} className="shrink-0" />
                      ) : (
                        <Folder size={16} className="shrink-0" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </div>
                    {project._count && project._count.tasks > 0 && (
                      <span className="ml-auto text-[10px] bg-muted group-hover:bg-background text-muted-foreground px-2 py-0.5 rounded-full">
                        {project._count.tasks}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="pt-6 border-t font-medium space-y-4">
            {session?.user && (
              <div className="flex items-center gap-3 px-2 py-1">
                <img
                  src={
                    session.user.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
                  }
                  alt="User"
                  className="w-10 h-10 rounded-full border shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground mb-2 rounded-xl px-4"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <>
                {theme === "dark" ? (
                  <Sun size={18} className="mr-3" />
                ) : (
                  <Moon size={18} className="mr-3" />
                )}
                {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
              </>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-4"
              onClick={handleSignOut}
            >
              <LogOut size={18} className="mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

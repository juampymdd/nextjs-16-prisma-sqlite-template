"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  TrendingUp,
  Flame,
  Folder,
  Search,
  Users,
  Plus,
} from "lucide-react";
import { authClient } from "@/app/libs/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/libs/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ["#3b82f6", "#e2e8f0"];

const DashboardHome = () => {
  const { tasks, fetchTasks, projects, fetchProjects } = useTaskStore();
  const { data: session } = authClient.useSession();
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  if (!isClient) return null;

  // Project data processing
  const projectsWithStats = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter((t) => t.completed).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...project,
        totalTasks: total,
        completedTasks: completed,
        progress,
        recentTasks: projectTasks.slice(0, 3),
      };
    });

  const assignedTasks = tasks.filter(
    (t) => t.assigneeId === session?.user?.id && !t.completed,
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Stats for the top row
  const stats = [
    {
      label: "Proyectos Activos",
      value: projects.length,
      icon: Folder,
      color: "from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/10",
    },
    {
      label: "Tareas Totales",
      value: totalTasks,
      icon: ListTodo,
      color: "from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/10",
    },
    ...(assignedTasks.length > 0
      ? [
          {
            label: "Asignadas a mí",
            value: assignedTasks.length,
            icon: Users,
            color: "from-orange-500/20 to-orange-500/5 text-orange-500 border-orange-500/10",
          },
        ]
      : []),
    {
      label: "Completadas",
      value: completedTasks,
      icon: CheckCircle2,
      color: "from-green-500/20 to-green-500/5 text-green-500 border-green-500/10",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/50">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            Resumen Global
          </h1>
          <p className="text-muted-foreground font-medium pl-1 border-l-2 border-primary/20 uppercase tracking-[0.2em] text-[10px]">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl border border-border/10 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-xl border border-white/5 shadow-sm">
            <Flame className="text-orange-500 h-4 w-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
              Racha: 5 días
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="group relative border-none bg-gradient-to-br from-card to-muted/20 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
          >
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
                <h3 className="text-4xl font-black tabular-nums">{stat.value}</h3>
              </div>
              <div className={cn("p-4 rounded-2xl bg-gradient-to-tr border shadow-sm group-hover:scale-110 transition-transform duration-500", stat.color)}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
              {/* Decorative gradient blur */}
              <div className={cn("absolute -bottom-8 -right-8 w-24 h-24 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20", stat.color.split(' ')[2])} />
            </CardContent>
          </Card>
        ))}
      </div>

      {assignedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              Tareas Asignadas a Mí
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedTasks.slice(0, 3).map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              return (
                <Card
                  key={task.id}
                  className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-gradient-to-br from-card to-orange-50/5 dark:to-orange-950/5"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/dashboard/projects/${task.projectId}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full"
                        >
                          {project?.name || "Sin Proyecto"}
                        </Link>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] uppercase font-bold border-none bg-muted",
                            task.priority === "high" &&
                              "text-red-500 bg-red-50 dark:bg-red-950/30",
                            task.priority === "medium" &&
                              "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
                            task.priority === "low" &&
                              "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                          )}
                        >
                          {task.priority === "high"
                            ? "Alta"
                            : task.priority === "medium"
                              ? "Media"
                              : "Baja"}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                        {task.description || "Sin descripción"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Tus Proyectos</h2>
          <div className="flex items-center gap-4 flex-1 md:max-w-md relative">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Buscar proyectos..."
                className="pl-10 rounded-xl bg-card border-none shadow-sm h-10 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click on suggestions
              />

              {/* Autocomplete Dropdown */}
              {isSearchFocused &&
                searchQuery.length > 0 &&
                projectsWithStats.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border/10 bg-muted/30">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                        Sugerencias
                      </p>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {projectsWithStats.slice(0, 6).map((project) => (
                        <Link
                          key={project.id}
                          href={`/dashboard/projects/${project.id}`}
                          className="flex items-center justify-between p-3 hover:bg-primary/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Folder size={16} className="text-primary" />
                            <span className="text-sm font-semibold truncate max-w-[200px]">
                              {project.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold">
                              {project.progress}%
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl hidden sm:flex shrink-0"
            >
              <Link href="/dashboard/projects">Ver todos</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithStats.map((project) => (
            <Card
              key={project.id}
              className="group overflow-hidden border-border/10 rounded-[2.5rem] bg-gradient-to-br from-card to-muted/20 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-700 h-full flex flex-col"
            >
              <Link href={`/dashboard/projects/${project.id}`} className="flex flex-col h-full p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                    <Folder size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {project.completed && (
                      <span className="text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 uppercase shadow-sm">
                        Cerrado
                      </span>
                    )}
                    <span className="text-xl font-black bg-muted/40 px-4 py-1.5 rounded-2xl tabular-nums shadow-inner text-primary/80 border border-white/5">
                      {project.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm font-medium text-muted-foreground/60 leading-relaxed min-h-[2.5rem]">
                    {project.description || "Sin descripción"}
                  </CardDescription>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="h-4 w-full bg-muted/30 rounded-full overflow-hidden p-1 shadow-inner border border-border/5">
                    <div
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] px-1">
                    <span>{project.completedTasks} Hechas</span>
                    <span>{project.totalTasks} Total</span>
                  </div>

                  <div className="pt-4 border-t border-border/5 group-hover:border-primary/10 transition-colors">
                    <p className="text-[9px] font-black text-muted-foreground/30 mb-4 uppercase tracking-[0.3em]">
                      Vista previa
                    </p>
                    <div className="space-y-3">
                      {project.recentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 text-[13px] font-bold text-muted-foreground group/task"
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full transition-all duration-500",
                              task.completed 
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                                : "bg-muted-foreground/20 group-hover/task:bg-primary/40",
                            )}
                          />
                          <span
                            className={cn(
                              "truncate transition-all duration-500",
                              task.completed 
                                ? "line-through opacity-30 text-muted-foreground" 
                                : "group-hover/task:translate-x-1 group-hover/task:text-foreground",
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {project.recentTasks.length === 0 && (
                        <div className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/10 rounded-2xl group-hover:border-primary/10 transition-all">
                          <Plus size={14} className="text-muted-foreground/20 mb-1" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/20 italic">
                            Lista limpia
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
          {projectsWithStats.length === 0 && (
            <Card className="col-span-full border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Folder size={48} className="text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold">
                  {searchQuery
                    ? "No se encontraron proyectos"
                    : "No tienes proyectos"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Intenta con otro término de búsqueda."
                    : "Empieza creando tu primer proyecto para organizar tus tareas."}
                </p>
                {!searchQuery && (
                  <Button asChild className="rounded-xl font-bold">
                    <Link href="/dashboard/projects">Crear Proyecto</Link>
                  </Button>
                )}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rendimiento Global</CardTitle>
                <CardDescription>
                  Tareas completadas por proyecto
                </CardDescription>
              </div>
              <TrendingUp className="text-muted-foreground" size={20} />
            </div>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsWithStats.slice(0, 5)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="completedTasks"
                  name="Completadas"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalTasks"
                  name="Total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Resumen de Tareas</CardTitle>
            <CardDescription>Estado de todas tus tareas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Completadas", value: completedTasks },
                    { name: "Pendientes", value: pendingTasks },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {completedTasks}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Hechas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {pendingTasks}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;

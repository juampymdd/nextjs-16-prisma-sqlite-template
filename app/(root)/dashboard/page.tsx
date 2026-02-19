"use client";

import { useTaskStore } from "@/libs/store/useTaskStore";
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
} from "lucide-react";
import { cn } from "@/libs/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLORS = ["#3b82f6", "#e2e8f0"];

const DashboardHome = () => {
  const { tasks, fetchTasks, projects, fetchProjects } = useTaskStore();
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
      color: "text-blue-500",
    },
    {
      label: "Tareas Totales",
      value: totalTasks,
      icon: ListTodo,
      color: "text-purple-500",
    },
    {
      label: "Completadas",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Productividad Global",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Dashboard de Proyectos
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus proyectos y visualiza su progreso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-border/40 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
              </div>
              <div className={cn("p-3 rounded-2xl bg-muted/50", stat.color)}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithStats.map((project) => (
            <Card
              key={project.id}
              className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all"
            >
              <Link href={`/dashboard/projects/${project.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Folder size={20} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <CardTitle className="mt-4 text-xl">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {project.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>{project.completedTasks} Completadas</span>
                    <span>{project.totalTasks} Total</span>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                      Últimas tareas
                    </p>
                    <div className="space-y-2">
                      {project.recentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              task.completed ? "bg-green-500" : "bg-primary/40",
                            )}
                          />
                          <span
                            className={cn(
                              "truncate",
                              task.completed &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {project.recentTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          Sin tareas aún
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
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

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  LayoutDashboard,
  Layers,
  Users,
  ArrowRight,
  Github,
  CheckSquare,
  BarChart3,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/app/libs/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <CheckSquare className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">TaskFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="#features"
          >
            Características
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Comenzar Gratis</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                  Novedad: Tablero Kanban Interactivo 🚀
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none max-w-[800px]">
                  Gestiona tus proyectos con la eficiencia de un experto
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  La herramienta de gestión de tareas diseñada para equipos
                  modernos. Organiza, colabora y entrega tus proyectos a tiempo
                  con TaskFlow.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[300px] justify-center pt-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 text-lg px-8"
                  >
                    Empieza Ahora <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 text-lg px-8"
                  >
                    <Github className="h-5 w-5" /> GitHub
                  </Button>
                </Link>
              </div>
              <div className="mt-12 w-full max-w-5xl border rounded-xl overflow-hidden shadow-2xl bg-card animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-muted h-6 flex items-center gap-2 px-3 border-b">
                  <div className="w-3 h-3 rounded-full bg-destructive/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="aspect-video bg-muted/30 flex items-center justify-center p-8">
                  <div className="grid grid-cols-3 gap-4 w-full h-full opacity-60">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-card border rounded-lg p-4 space-y-3"
                      >
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-20 bg-muted/50 rounded" />
                        <div className="flex gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted" />
                          <div className="h-6 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm border rounded-full px-6 py-3 font-semibold shadow-lg flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5 text-primary" />{" "}
                      Vista Previa del Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Todo lo que necesitas para tu flujo de trabajo
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Diseñado para ser intuitivo pero potente. Sin configuraciones
                  complicadas, solo productividad.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Tableros Kanban</h3>
                <p className="text-muted-foreground text-center">
                  Visualiza el progreso de tus tareas arrastrando y soltando
                  entre columnas personalizadas.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Layers className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Gestión de Proyectos</h3>
                <p className="text-muted-foreground text-center">
                  Organiza tus tareas en proyectos ilimitados. Filtra y mantén
                  el foco en lo importante.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Subtareas & Prioridades</h3>
                <p className="text-muted-foreground text-center">
                  Divide tareas complejas y marca prioridades para no perder de
                  vista los hitos críticos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">10k+</h4>
                <p className="text-primary-foreground/80">Usuarios Activos</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">1M+</h4>
                <p className="text-primary-foreground/80">Tareas Completadas</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">99.9%</h4>
                <p className="text-primary-foreground/80">
                  Tiempo de Actividad
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">24/7</h4>
                <p className="text-primary-foreground/80">Soporte Técnico</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="max-w-[600px] mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                ¿Listo para mejorar tu productividad?
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Únete a miles de profesionales que ya han optimizado su forma de
                trabajar con TaskFlow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full sm:w-auto px-12">
                    Empieza hoy mismo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 TaskFlow. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              href="#"
            >
              Privacidad
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              href="#"
            >
              Términos
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              href="#"
            >
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

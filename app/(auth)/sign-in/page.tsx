"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Moon, Sun, ArrowRight, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/libs/auth-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const signInSchema = z.object({
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(1, {
    message: "La contraseña es obligatoria.",
  }),
});

export default function SignInPage() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setLoading(true);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("¡Inicio de sesión exitoso!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Credenciales incorrectas");
          setLoading(false);
        },
      },
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Background blobs decorativos */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="glass"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      <Card className="w-full max-w-[420px] border border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-primary to-purple-600" />
        <CardHeader className="space-y-2 pt-10 pb-6">
          <CardTitle className="text-4xl font-black tracking-tight text-center bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bienvenido
          </CardTitle>
          <CardDescription className="text-center text-base font-medium text-muted-foreground">
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground/80">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                        className="h-12 bg-background/40 rounded-xl border-border/40 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between ml-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                        Contraseña
                      </FormLabel>
                      <Link
                        href="#"
                        className="text-[10px] font-bold uppercase tracking-tighter text-primary hover:opacity-80 transition-opacity"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="h-12 bg-background/40 rounded-xl border-border/40 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base font-bold rounded-2xl group transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pb-10 pt-4">
          <p className="w-full text-center text-sm font-medium text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-black hover:underline underline-offset-4 decoration-2 transition-all"
            >
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

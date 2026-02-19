"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Moon, Sun, Upload, Image as ImageIcon, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { signUpSchema } from "@/libs/schemas/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/libs/auth-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

export default function SignUpPage() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: "",
    },
  });

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageChange(file);
  };

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        image: values.image,
      },
      {
        onSuccess: () => {
          toast.success("¡Cuenta creada correctamente!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Error al crear la cuenta");
        },
      },
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Luces de fondo dinámicas */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-background/50 backdrop-blur-md"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <Card className="w-full max-w-md border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-4xl font-black tracking-tight text-center bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground font-medium">
            Regístrate para gestionar tus tareas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 border-dashed transition-all duration-300 overflow-hidden ${
                      isDragging
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-muted-foreground/20 bg-muted/5"
                    } ${preview ? "border-solid border-primary" : ""}`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <label
                        htmlFor="profile-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/10 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                          Subir Foto
                        </span>
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageChange(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {preview && (
                    <button
                      type="button"
                      title="Eliminar imagen"
                      onClick={() => {
                        setPreview(null);
                        form.setValue("image", "");
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-destructive backdrop-blur-md text-white p-1.5 rounded-full shadow-2xl transition-all duration-300 z-20 border border-white/20 cursor-pointer hover:rotate-90 scale-100 hover:scale-110 active:scale-95 group/del"
                    >
                      <X
                        size={14}
                        strokeWidth={2.5}
                        className="drop-shadow-sm"
                      />
                    </button>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Arrastra o haz clic para subir tu foto
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground/80">
                      Nombre Completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre aquí"
                        {...field}
                        value={field.value ?? ""}
                        className="h-12 bg-background/40 rounded-xl border-border/40 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        value={field.value ?? ""}
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground/80">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        value={field.value ?? ""}
                        className="h-12 bg-background/40 rounded-xl border-border/40 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest ml-1 text-muted-foreground/80">
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        value={field.value ?? ""}
                        className="h-12 bg-background/40 rounded-xl border-border/40 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full h-14 text-base font-bold rounded-2xl group transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
              >
                {form.formState.isSubmitting ? "Procesando..." : "Crear Cuenta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="text-center text-sm font-medium text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-primary hover:underline underline-offset-4 decoration-2 transition-all"
            >
              Inicia Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

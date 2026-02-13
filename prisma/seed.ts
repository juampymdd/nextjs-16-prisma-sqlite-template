import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes (opcional)
  await prisma.task.deleteMany();
  console.log("✨ Datos existentes eliminados");

  // Crear tareas de ejemplo
  const tasks = [
    {
      title: "Instalar dependencias",
      description:
        "Ejecutar bun install para instalar todas las dependencias del proyecto",
      completed: true,
    },
    {
      title: "Configurar Prisma",
      description:
        "Configurar el schema de Prisma y el archivo prisma.config.ts",
      completed: true,
    },
    {
      title: "Generar cliente de Prisma",
      description: "Ejecutar bunx prisma generate para generar el cliente",
      completed: true,
    },
    {
      title: "Ejecutar migraciones",
      description: "Correr bunx prisma migrate dev para crear la base de datos",
      completed: true,
    },
    {
      title: "Iniciar servidor de desarrollo",
      description:
        "Ejecutar bun dev para iniciar la aplicación en modo desarrollo",
      completed: false,
    },
    {
      title: "Probar Prisma Studio",
      description: "Abrir bunx prisma studio para visualizar los datos",
      completed: false,
    },
    {
      title: "Implementar funcionalidad completa",
      description: "Agregar operaciones CRUD completas para las tareas",
      completed: false,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log(`✅ Se crearon ${tasks.length} tareas de ejemplo`);
  console.log("🎉 Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

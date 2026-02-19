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
  await prisma.user.deleteMany();
  console.log("✨ Datos existentes eliminados");

  // Crear un usuario de prueba
  const testUser = await prisma.user.create({
    data: {
      name: "Juan Perez",
      email: "juan@example.com",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    },
  });
  console.log(`👤 Usuario de prueba creado: ${testUser.email}`);

  // Crear tareas de ejemplo relacionadas al usuario
  const tasks = [
    {
      title: "Instalar dependencias",
      description:
        "Ejecutar bun install para instalar todas las dependencias del proyecto",
      completed: true,
      userId: testUser.id,
    },
    {
      title: "Configurar Prisma",
      description:
        "Configurar el schema de Prisma y el archivo prisma.config.ts",
      completed: true,
      userId: testUser.id,
    },
    {
      title: "Generar cliente de Prisma",
      description: "Ejecutar bunx prisma generate para generar el cliente",
      completed: true,
      userId: testUser.id,
    },
    {
      title: "Ejecutar migraciones",
      description: "Correr bunx prisma migrate dev para crear la base de datos",
      completed: true,
      userId: testUser.id,
    },
    {
      title: "Iniciar servidor de desarrollo",
      description:
        "Ejecutar bun dev para iniciar la aplicación en modo desarrollo",
      completed: false,
      userId: testUser.id,
    },
    {
      title: "Probar Prisma Studio",
      description: "Abrir bunx prisma studio para visualizar los datos",
      completed: false,
      userId: testUser.id,
    },
    {
      title: "Implementar funcionalidad completa",
      description: "Agregar operaciones CRUD completas para las tareas",
      completed: false,
      userId: testUser.id,
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

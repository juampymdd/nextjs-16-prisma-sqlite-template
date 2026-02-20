import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

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

  // Crear un proyecto por defecto ya que es obligatorio
  const defaultProject = await prisma.project.create({
    data: {
      name: "Mi Primer Proyecto",
      description: "Proyecto creado automáticamente",
      userId: testUser.id,
    },
  });
  console.log(`📁 Proyecto por defecto creado: ${defaultProject.name}`);

  // Crear tareas de ejemplo relacionadas al usuario y al proyecto
  const tasks = [
    {
      title: "Instalar dependencias",
      description:
        "Ejecutar bun install para instalar todas las dependencias del proyecto",
      completed: true,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Configurar Prisma",
      description:
        "Configurar el schema de Prisma y el archivo prisma.config.ts",
      completed: true,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Generar cliente de Prisma",
      description: "Ejecutar bunx prisma generate para generar el cliente",
      completed: true,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Ejecutar migraciones",
      description: "Correr bunx prisma migrate dev para crear la base de datos",
      completed: true,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Iniciar servidor de desarrollo",
      description:
        "Ejecutar bun dev para iniciar la aplicación en modo desarrollo",
      completed: false,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Probar Prisma Studio",
      description: "Abrir bunx prisma studio para visualizar los datos",
      completed: false,
      userId: testUser.id,
      projectId: defaultProject.id,
    },
    {
      title: "Implementar funcionalidad completa",
      description: "Agregar operaciones CRUD completas para las tareas",
      completed: false,
      userId: testUser.id,
      projectId: defaultProject.id,
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

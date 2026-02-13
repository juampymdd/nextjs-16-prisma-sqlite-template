# Next.js + Prisma + TypeScript Starter

Aplicación de tareas construida con Next.js 16, Prisma 7.4 y TypeScript, usando Bun como runtime.

## Requisitos previos

- [Bun](https://bun.sh/) instalado

## Instalación

1. **Instalar dependencias**
```bash
bun install
```

2. **Configurar Prisma**

El proyecto ya tiene configurado Prisma con SQLite. La configuración se encuentra en:
- `prisma/schema.prisma` - Define el modelo de datos
- `prisma.config.ts` - Configura la conexión a la base de datos

3. **Generar el cliente de Prisma**
```bash
bunx prisma generate
```

4. **Ejecutar las migraciones de la base de datos**
```bash
bunx prisma migrate dev --name add_completed_field
```

Esto creará la base de datos SQLite y las tablas necesarias.

5. **Poblar la base de datos con datos de ejemplo (opcional)**
```bash
bun run seed
```

Este comando ejecuta el seed que crea tareas de ejemplo siguiendo los pasos del setup.

## Comandos disponibles

### Desarrollo
```bash
bun dev
```
Inicia el servidor de desarrollo en `http://localhost:3000`

### Build de producción
```bash
bun run build
```
Crea un build optimizado para producción

### Prisma Studio
```bash
bunx prisma studio
```
Abre Prisma Studio en el navegador para visualizar y editar los datos de la base de datos

### Generar cliente de Prisma
```bash
bunx prisma generate
```
Regenera el cliente de Prisma después de cambios en el schema

### Crear nueva migración
```bash
bunx prisma migrate dev --name nombre_de_la_migracion
```
Crea y aplica una nueva migración

### Seed de la base de datos
```bash
bun run seed
```
Pobla la base de datos con tareas de ejemplo

## Estructura del proyecto

```
├── app/
│   ├── api/
│   │   └── task/
│   │       ├── route.ts          # GET y POST /api/task
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE /api/task/:id
│   ├── libs/
│   │   └── prisma.ts             # Cliente de Prisma configurado
│   └── new/
│       └── page.tsx              # Página para crear tareas
├── prisma/
│   ├── schema.prisma             # Esquema de la base de datos
│   └── migrations/               # Historial de migraciones
└── prisma.config.ts              # Configuración de Prisma

```

## Modelo de datos

```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

## Tecnologías

- **Next.js 16** - Framework de React
- **Prisma 7.4** - ORM para base de datos
- **TypeScript** - Tipado estático
- **Bun** - Runtime de JavaScript
- **SQLite** - Base de datos
- **@prisma/adapter-libsql** - Adapter de Prisma para Bun

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [YouTube Tutorial](https://www.youtube.com/watch?v=8gb7PtmwP2U)

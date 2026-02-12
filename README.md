# Next.js, Prisma, and TypeScript Starter

# Create Next.js App with bun 
```bash
bun create next . --typescript
```

# Install Prisma and its dependencies
```bash
bun add prisma @prisma/client
```
# Initialize Prisma
```bash
bun x prisma init --datasource-provider sqlite
```

# Create a Task model in `prisma/schema.prisma`
```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```
# Generate Prisma Client
```bash
bun x prisma generate
```
# Migrate the database
```bash
bun x prisma migrate dev --name init
```
# Run
```bash
bun dev
```

# Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [YouTube Tutorial](https://www.youtube.com/watch?v=8gb7PtmwP2U)

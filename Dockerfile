# Etapa de dependencias
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile
RUN bun prisma generate

# Etapa de construcción
FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Etapa de producción
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "start"]

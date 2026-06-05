# Frontend Dockerfile для Next.js (multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Устанавливаем зависимости для сборки
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Копируем исходники и собираем приложение
COPY . .
# Очистим NODE_OPTIONS на время сборки — иногда в окружении передаётся
# флаг `--ignoreDeprecations`, который вызывает ошибку при сборке.
ENV NODE_OPTIONS=""
RUN echo "DEBUG: NODE_OPTIONS='$NODE_OPTIONS'" && echo "--- env ---" && env || true
RUN npm run build

# Рантайм изображение
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Устанавливаем только production-зависимости
COPY package.json package-lock.json ./
RUN npm ci --production

# Копируем артефакты сборки
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000
CMD ["npm", "run", "start"]

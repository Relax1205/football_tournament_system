# Используем Debian-based образ, чтобы Prisma стабильно работала с OpenSSL
FROM node:20-bookworm-slim

# Создаем рабочую директорию
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем весь код проекта
COPY . .

# Генерируем Prisma Client внутри контейнера
RUN npx prisma generate

# Собираем TypeScript в JavaScript
RUN npm run build

# Открываем порт (из .env)
EXPOSE 4000

# Команда для запуска сервера
CMD ["node", "dist/index.js"]

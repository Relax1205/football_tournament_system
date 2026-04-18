# Используем официальный образ Node.js (Alpine - облегченный)
FROM node:20-alpine

# Создаем рабочую директорию
WORKDIR /app

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
# Football Tournament System

Веб-приложение для управления футбольными турнирами. Проект включает:

- `frontend` на `Next.js 14`
- `backend` на `Express + Prisma`
- `PostgreSQL`

Система покрывает основные сценарии:

- регистрация и вход пользователей
- роли `admin`, `organizer`, `referee`, `coach`, `fan`
- управление турнирами
- заявки команд
- составы и игроки
- генерация расписания
- ввод и подтверждение результатов матчей
- расчёт турнирной таблицы
- уведомления в интерфейсе
- экспорт PDF и Excel

## Требования

- `Node.js 20.x`
- `npm`
- `Docker Desktop` для рекомендованного запуска

Если запускать без Docker, нужен доступный `PostgreSQL 15+`.

## Быстрый запуск локально через Docker

Это самый простой способ поднять проект целиком.

Из корня репозитория:

```bash
npm install
npm run dev
```

Альтернатива без npm-скрипта:

```bash
docker compose up --build
```

После запуска будут доступны:

- `http://localhost:3000` — frontend
- `http://localhost:4000` — backend API
- `http://localhost:4000/health` — healthcheck backend
- `localhost:5433` — PostgreSQL

Что происходит при первом старте:

- поднимается база данных
- backend применяет `prisma db push`
- загружаются seed-данные
- запускаются backend и frontend

Полезные команды из корня:

```bash
npm run start
npm run stop
npm run reset
npm run logs
```

Назначение:

- `npm run start` — поднять уже собранные контейнеры
- `npm run stop` — остановить контейнеры
- `npm run reset` — удалить контейнеры и volume базы
- `npm run logs` — смотреть логи сервисов

## Локальный запуск без Docker

Если хочешь запускать frontend и backend как обычные локальные процессы, можно использовать такой сценарий.

### 1. Поднять PostgreSQL

Вариант A: использовать свой локальный PostgreSQL.

Вариант B: поднять только БД через Docker:

```bash
docker compose up -d db
```

База должна быть доступна по строке:

```env
postgresql://postgres:postgres@localhost:5433/football_tournament_db?schema=public
```

### 2. Запустить backend

Файл `backend/.env` должен содержать:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/football_tournament_db?schema=public
PORT=4000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d
```

Команды:

```bash
cd backend
npm install
npm run prisma:generate
npx prisma db push
npx prisma db seed
npm run dev
```

Backend будет доступен на `http://localhost:4000`.

### 3. Запустить frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Файл `frontend/.env`:

```env
API_PROXY_TARGET=http://localhost:4000
```

Frontend будет доступен на `http://localhost:3000`.

## Тестовые аккаунты

Пароль для всех demo-пользователей:

```text
Test123!
```

Аккаунты:

- `admin@tournament.ru`
- `org@tournament.ru`
- `referee@tournament.ru`
- `coach@tournament.ru`
- `coach2@team.ru`
- `fan@tournament.ru`

Также можно зарегистрировать нового пользователя через страницу `/register`. Новый аккаунт создаётся с ролью `VIEWER`, а администратор потом может выдать нужные права из панели ролей.

## Seed-данные

После `docker compose up` или `npx prisma db seed` в системе уже есть данные для проверки:

- турниры
- команды
- игроки
- матчи в разных статусах
- заявки в разных статусах
- demo-уведомления

Это позволяет сразу проверять интерфейс и роли без ручной подготовки базы.

## Проверка проекта

### Сборка

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

### Backend smoke / e2e

```bash
cd backend
npm run test:e2e
```

Сценарии включают:

- логин по ролям
- регистрацию нового viewer
- уведомления
- создание турнира
- заявки и одобрение
- создание игроков
- генерацию расписания
- повторную генерацию расписания без удаления старых матчей
- ввод и подтверждение результата
- пересчёт таблицы
- экспорт PDF и Excel

### UI-тесты

```bash
cd frontend
npm run test:ui
```

Покрываются:

- позитивный и негативный вход
- регистрация viewer
- работа колокольчика уведомлений
- создание турнира
- ввод результата матча
- валидация минуты гола
- read-only режим для болельщика
- подача заявки тренером
- экспорт и локализация

## Краткий сценарий ручной проверки

1. Открой `http://localhost:3000`.
2. Войди как `org@tournament.ru / Test123!`.
3. Проверь создание турнира и генерацию расписания.
4. Войди как `referee@tournament.ru / Test123!` и введи результат матча.
5. Вернись под `organizer` и подтверди результат.
6. Войди как `admin@tournament.ru / Test123!` и измени роль одному из пользователей.
7. Проверь колокольчик уведомлений.
8. Зарегистрируй нового пользователя через `/register`.

## Если что-то не запускается

Проверь:

- запущен ли Docker Desktop;
- свободны ли порты `3000`, `4000`, `5433`;
- отвечает ли `http://localhost:4000/health`;
- не остались ли старые контейнеры от предыдущих запусков.

Если нужен полностью чистый старт:

```bash
npm run reset
npm run dev
```

# Football Tournament System

Веб-приложение для управления футбольными турнирами. Система помогает организаторам вести турнир целиком: создавать соревнования, принимать заявки команд, хранить составы игроков, формировать расписание матчей, фиксировать результаты, рассчитывать турнирную таблицу и выгружать отчёты.

Проект разделён на две части:

- `frontend` на `Next.js`
- `backend` на `Express + Prisma + PostgreSQL`

## Быстрый запуск

Самый простой вариант запуска всего проекта:

```bash
docker compose up --build
```

После старта будут доступны:

- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`
- healthcheck backend: `http://localhost:4000/health`
- PostgreSQL: `localhost:5433`

Остановка:

```bash
docker compose down
```

Если удобнее запускать из корня через `npm`, подготовлены короткие команды:

```bash
npm run dev
npm run stop
```

Что важно:

- дополнительный `npm install` в корне не нужен
- `docker compose` сам поднимает базу данных, backend и frontend
- сервис `backend-init` автоматически выполняет `prisma db push` и `prisma db seed`
- на первом запуске сборка может занять несколько минут, потому что Docker скачивает образы и собирает контейнеры

## Возможности системы

Система покрывает основные процессы предметной области:

- регистрация и вход пользователей
- разграничение доступа по ролям
- создание и редактирование турниров
- управление статусами турниров
- подача заявок команд на участие
- подтверждение или отклонение заявок
- ведение списка команд и игроков
- генерация расписания матчей
- ввод счёта и событий матча
- подтверждение результатов организатором
- автоматический расчёт турнирной таблицы
- просмотр статистики игроков
- экспорт протокола матча в `PDF`
- экспорт турнирной таблицы в `Excel`

## Роли пользователей

В проекте используется ролевая модель доступа `RBAC`.

Поддерживаются роли:

- `ADMIN` — администратор системы
- `ORGANIZER` — организатор турнира
- `REFEREE` — судья матча
- `COACH` — тренер команды
- `VIEWER` — болельщик или наблюдатель

Типовые сценарии по ролям:

- `ADMIN` управляет пользователями и ролями
- `ORGANIZER` создаёт турниры, принимает заявки, формирует расписание, подтверждает результаты и выгружает отчёты
- `REFEREE` вносит счёт и события матча
- `COACH` подаёт заявку команды и ведёт состав игроков
- `VIEWER` просматривает турниры, матчи, таблицу и статистику

## Тестовые аккаунты

После запуска через Docker demo-данные создаются автоматически.

Пароль для всех тестовых пользователей:

```text
TestPass123!
```

Доступные аккаунты:

- `admin@tournament.ru`
- `organizer@tournament.ru`
- `referee@tournament.ru`
- `coach@tournament.ru`
- `coach2@team.ru`
- `fan@tournament.ru`

## Архитектура

Проект построен по классической трёхуровневой схеме:

1. Уровень представления  
   `frontend` на `Next.js 14` и `React 18`

2. Уровень приложений  
   `backend` на `Express` с бизнес-логикой, авторизацией, валидацией и генерацией отчётов

3. Уровень данных  
   `PostgreSQL` + `Prisma ORM`

Ключевые архитектурные решения:

- frontend и backend разнесены по отдельным каталогам
- frontend работает с backend через HTTP API
- backend предоставляет REST API
- валидация входных данных выполняется через `zod`
- авторизация построена на `JWT`
- пароли хранятся в хэшированном виде через `bcryptjs`
- отчёты формируются на сервере
- контейнерный запуск собирает и поднимает проект целиком одной командой

## Технологический стек

Frontend:

- `Next.js 14`
- `React 18`
- `TypeScript`
- `App Router`
- `Selenium WebDriver` для UI-тестов

Backend:

- `Node.js`
- `Express`
- `TypeScript`
- `Prisma`
- `PostgreSQL`
- `Zod`
- `jsonwebtoken`
- `bcryptjs`
- `pdfkit`
- `exceljs`

Инфраструктура:

- `Docker`
- `docker compose`

## Структура репозитория

```text
football_tournament_system/
|-- backend/
|-- frontend/
|-- docs-stub/
|-- docker-compose.yml
|-- package.json
`-- README.md
```

Основные каталоги:

- `backend` — серверная часть и модель данных
- `frontend` — пользовательский интерфейс
- `docs-stub` — сгенерированная документация разработчика

## Основные backend-модули

Backend реализует следующие API-разделы:

- `/api/auth` — регистрация и вход
- `/api/users` — просмотр пользователей и изменение ролей
- `/api/tournaments` — управление турнирами
- `/api/teams` — команды и составы
- `/api/players` — игроки и статистика
- `/api/applications` — заявки на участие
- `/api/matches` — матчи и результаты
- `/api/match-events` — события матчей
- `/api/standings` — турнирная таблица
- `/api/schedule` — генерация расписания
- `/api/reports` — выгрузка `PDF` и `Excel`
- `/health` — проверка доступности backend

## Команды из корня репозитория

В корневом [package.json](/c:/Users/relax/Documents/football_tournament_system/package.json) добавлены короткие команды для управления проектом:

```bash
npm run dev
npm run start
npm run stop
npm run reset
npm run logs
```

Назначение:

- `npm run dev` — поднять весь проект через `docker compose up --build`
- `npm run start` — то же самое, альтернативное имя
- `npm run stop` — остановить контейнеры
- `npm run reset` — полностью сбросить контейнеры и том базы данных
- `npm run logs` — смотреть логи всех сервисов

Если нужен самый короткий сценарий, достаточно двух команд:

```bash
npm run dev
npm run stop
```

## Локальный запуск без Docker

Этот режим нужен только если хочется запускать frontend и backend отдельно.

### 1. Поднять PostgreSQL

Нужна локальная база данных `PostgreSQL`. Backend умеет подключаться двумя способами:

- через готовый `DATABASE_URL`
- через отдельные локальные переменные `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### 2. Запустить backend

```bash
cd backend
copy .env.example .env
npm install
npm run db:check
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Запустить frontend

Во втором терминале:

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

## Переменные окружения

Backend, файл `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/football_tournament_db?schema=public
PORT=4000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d
```

Локальная альтернатива без ручной сборки строки подключения:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_tournament_db
DB_USER=postgres
DB_PASSWORD=your-local-postgres-password
DB_SCHEMA=public
PORT=4000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d
```

Frontend, файл `frontend/.env.local`:

```env
API_PROXY_TARGET=http://localhost:4000
```

Для контейнерного запуска эти значения уже задаются в [docker-compose.yml](/c:/Users/relax/Documents/football_tournament_system/docker-compose.yml), поэтому ручное создание `.env` не требуется.

## Проверка сборки

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

## Тестирование

В frontend подготовлены UI-тесты на Selenium.

Запуск:

```bash
cd frontend
npm run test:ui
```

Примеры проверяемых сценариев:

- вход пользователя
- создание турнира
- ввод результата матча
- разграничение прав доступа
- подача заявки тренером

## Документация

Пользовательские материалы находятся в `frontend/docs/wiki`.

Материалы по тестированию находятся в `frontend/docs/testing`.

Документация разработчика доступна в:

- `docs-stub/docs_output/index.html`

## Что находится в проекте сейчас

На текущем этапе проект уже включает:

- рабочий frontend
- рабочий backend
- PostgreSQL-схему через Prisma
- seed с demo-данными
- ролевую модель доступа
- генерацию расписания и турнирной таблицы
- экспорт отчётов
- Docker-сценарий запуска одной командой

## Частые команды

Полезные команды для повседневной работы:

```bash
docker compose up --build
docker compose down
docker compose logs -f
docker compose down -v
```

## Если что-то не запускается

Проверь в первую очередь:

- запущен ли Docker Desktop
- свободны ли порты `3000`, `4000` и `5433`
- не остались ли старые контейнеры от предыдущих запусков

Если нужно полностью пересоздать окружение:

```bash
npm run reset
npm run dev
```

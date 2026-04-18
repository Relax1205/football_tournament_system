# Football Tournament System

Учебный проект **«Система учёта футбольных турниров»**, собранный в корне репозитория по требованиям из отчётов по практическим работам.

Итоговая реализация использует:

- `frontend/` на `Next.js + React + TypeScript`
- `backend/` на `Express + Prisma + PostgreSQL`
- ролевую модель `RBAC` для администратора, организатора, судьи, тренера и болельщика
- заявки команд, составы игроков, расписание матчей, ввод результатов, турнирную таблицу и экспорт отчётов

## Структура

```text
backend/         # API, Prisma, seed, PDF/Excel export
frontend/        # web-интерфейс и UI-тесты
docs-stub/       # TypeDoc-стаб документации разработчика
backend_i/       # исходная backend-реализация для сравнения
frontend_l/      # исходная frontend-реализация для сравнения
docker-compose.yml
```

## Что реализовано

- авторизация и хранение паролей в хэшированном виде (`bcrypt`)
- разграничение прав доступа по ролям
- создание турниров и просмотр списка турниров
- автоматическая генерация расписания по круговой системе
- подача и одобрение заявок команд
- добавление игроков в составы
- ввод счёта и событий матча
- подтверждение результатов организатором
- автоматический пересчёт турнирной таблицы
- экспорт протокола матча в `PDF`
- экспорт турнирной таблицы в `Excel`
- пользовательская документация и Selenium UI-тесты

## Быстрый запуск локально

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Backend поднимется на `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend поднимется на `http://localhost:3000`.

## Запуск через Docker

```bash
docker compose up --build
```

После запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`
- postgres: `localhost:5432`

## Тестовые аккаунты

Пароль для всех тестовых пользователей: `TestPass123!`

- `admin@tournament.ru`
- `organizer@tournament.ru`
- `referee@tournament.ru`
- `coach@tournament.ru`
- `fan@tournament.ru`

## Документация

- фронтенд: [frontend/README.md](/c:/Users/relax/Documents/football_tournament_system/frontend/README.md)
- wiki-страницы: [frontend/docs/wiki/Home.md](/c:/Users/relax/Documents/football_tournament_system/frontend/docs/wiki/Home.md)
- тестовая документация: [frontend/docs/testing/test-program.md](/c:/Users/relax/Documents/football_tournament_system/frontend/docs/testing/test-program.md)
- TypeDoc-стаб: [docs-stub/index.html](/c:/Users/relax/Documents/football_tournament_system/docs-stub/docs_output/index.html)

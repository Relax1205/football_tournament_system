# Frontend

Frontend проекта **«Система учёта футбольных турниров»** на `Next.js 14`.

## Назначение

Интерфейс покрывает ключевые требования из ТЗ:

- вход по ролям и защита разделов
- турниры и генерация расписания
- матчи, ввод результата и подтверждение
- таблица и экспорт в `Excel`
- команды, заявки и статистика игроков
- управление ролями пользователей

## Структура

```text
app/
  dashboard/
  login/
  matches/
  standings/
  teams/
  tournaments/
components/
  access-guard.tsx
  auth-provider.tsx
  dashboard-overview.tsx
  dashboard-role-panels.tsx
  matches-client.tsx
  mock-api.ts
  mock-data.ts
  standings-client.tsx
  teams-client.tsx
  tournaments-client.tsx
docs/
  testing/
  wiki/
tests/
  ui/
```

## Запуск

```bash
copy .env.example .env.local
npm install
npm run dev
```

По умолчанию frontend ожидает backend на `http://localhost:4000`.

## Тестовые аккаунты

Пароль для всех ролей: `Test123!`

- `admin@tournament.ru`
- `org@tournament.ru`
- `referee@tournament.ru`
- `coach@tournament.ru`
- `fan@tournament.ru`

## UI-автотесты

```bash
npm run test:ui
```

Для запуска Selenium необходим установленный драйвер браузера.

## Документация

- Пользовательская документация: [docs/wiki/Home.md](docs/wiki/Home.md)
- Программа испытаний: [docs/testing/test-program.md](docs/testing/test-program.md)
- Тест-кейсы: [docs/testing/test-cases.md](docs/testing/test-cases.md)
- Матрица требований: [docs/testing/requirements-test-matrix.md](docs/testing/requirements-test-matrix.md)

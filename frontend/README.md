# Frontend

Фронтенд учебного проекта **«Система учёта футбольных турниров»**.

Этот каталог содержит:

- пользовательский интерфейс на `Next.js + React + TypeScript`
- mock-авторизацию и разграничение ролей
- UI-компоненты, формы и базовую клиентскую валидацию
- адаптивную стилизацию
- документацию пользователя в формате wiki

## Реализовано в текущей версии

- главная страница, вход и личный кабинет
- турниры с поиском, фильтрацией, сортировкой и созданием
- матчи с вводом результата и подтверждением
- турнирная таблица
- команды, заявки и статистика игроков
- mock API слой для демонстрации сценариев

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
  wiki/
  testing/
```

## Документация

- Пользовательская документация: [docs/wiki/Home.md](docs/wiki/Home.md)
- QA-документация: [docs/testing/test-cases.md](docs/testing/test-cases.md)
- Чек-лист: [docs/testing/checklist.md](docs/testing/checklist.md)
- Матрица требований: [docs/testing/requirements-test-matrix.md](docs/testing/requirements-test-matrix.md)
- Программа испытаний: [docs/testing/test-program.md](docs/testing/test-program.md)
- Отчёт о ручном тестировании: [docs/testing/manual-test-report.md](docs/testing/manual-test-report.md)
- Инструменты тестирования: [docs/testing/testing-tools.md](docs/testing/testing-tools.md)

## UI-автотесты

- Каркас Selenium WebDriver: [tests/ui/run-ui-tests.mjs](tests/ui/run-ui-tests.mjs)
- Инструкция по запуску: [tests/ui/README.md](tests/ui/README.md)

## Запуск

```bash
nvm use 22
npm install
npm run dev
```

## Текущие ограничения

- используется mock API вместо backend
- экспорт в PDF и Excel пока не реализован
- Selenium WebDriver подготовлен как стартовый каркас и требует установки браузерного драйвера
- GitHub Wiki ещё не опубликована, но локальные страницы уже подготовлены в `docs/wiki/`

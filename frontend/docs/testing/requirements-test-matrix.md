# Матрица требований и тестирования

Матрица связывает функциональные требования из отчётов №2 и №11 с текущим состоянием проекта.

| ID | Требование | Артефакт | Статус |
| --- | --- | --- | --- |
| FR-01 | Создание турнира через форму | `components/tournaments-client.tsx` | Реализовано |
| FR-02 | Добавление команды и состава | `components/teams-client.tsx`, backend teams/applications API | Реализовано |
| FR-03 | Формирование календаря матчей | `components/tournaments-client.tsx`, backend schedule API | Реализовано |
| FR-04 | Ввод результатов матча с валидацией | `components/matches-client.tsx` | Реализовано |
| FR-05 | Автоматический расчёт таблицы | `components/standings-client.tsx`, backend standings API | Реализовано |
| FR-06 | Просмотр расписания своей команды | раздел матчей | Реализовано |
| FR-07 | Просмотр статистики игроков | `components/teams-client.tsx` | Реализовано |
| FR-08 | Генерация PDF-протокола | `components/matches-client.tsx`, backend reports API | Реализовано |
| FR-09 | Экспорт таблицы в Excel | `components/standings-client.tsx`, backend reports API | Реализовано |
| FR-10 | Редактирование результата до подтверждения | `components/matches-client.tsx`, backend matches API | Реализовано |
| FR-11 | Управление ролями пользователей | `components/auth-provider.tsx`, `components/teams-client.tsx`, backend users API | Реализовано |
| FR-12 | Подача заявки на участие | `components/teams-client.tsx` | Реализовано |
| NFR-01 | Русскоязычный интерфейс | `app/`, `components/` | Реализовано |
| NFR-02 | Адаптивность интерфейса | `app/globals.css` | Частично реализовано |
| NFR-03 | Разграничение прав доступа | `components/access-guard.tsx` | Реализовано |
| NFR-04 | Пользовательская документация | `docs/wiki/` | Подготовлено |
| NFR-05 | Тест-кейсы и чек-листы | `docs/testing/` | Подготовлено |

## Комментарий

Статус `Подготовлено` означает, что артефакт создан в репозитории, но не является подтверждением фактического прохождения тестов.

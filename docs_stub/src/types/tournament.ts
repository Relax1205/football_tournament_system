/**
 * @module types/tournament
 * @description Типы данных для работы с турнирами
 * @author Команда ИКБО-11-23
 * @version 1.0.0
 */

/**
 * Статусы турнира в системе
 * 
 * @enum {string}
 * @readonly
 * @example
 * // Проверка статуса
 * if (tournament.status === TournamentStatus.ACTIVE) {
 *   console.log('Турнир активен');
 * }
 */
export enum TournamentStatus {
  /** Турнир находится в стадии планирования */
  DRAFT = "draft",
  /** Турнир активен, идёт регистрация команд */
  REGISTRATION = "registration",
  /** Турнир активен, идут матчи */
  IN_PROGRESS = "in_progress",
  /** Турнир завершён */
  COMPLETED = "completed",
  /** Турнир отменён */
  CANCELLED = "cancelled"
}

/**
 * Формат проведения турнира
 * 
 * @enum {string}
 * @readonly
 */
export enum TournamentFormat {
  /** Лиговая система (круговой турнир) */
  LEAGUE = "league",
  /** Кубковая система (плей-офф) */
  KNOCKOUT = "knockout",
  /** Смешанная система (группы + плей-офф) */
  HYBRID = "hybrid"
}

/**
 * Основная модель турнира
 * 
 * @interface Tournament
 * @property {string} id - Уникальный идентификатор турнира (UUID)
 * @property {string} name - Название турнира (3-100 символов)
 * @property {string} description - Описание турнира
 * @property {Date} startDate - Дата начала турнира
 * @property {Date} endDate - Дата окончания турнира
 * @property {TournamentFormat} format - Формат проведения
 * @property {TournamentStatus} status - Текущий статус
 * @property {string} organizerId - ID организатора турнира
 * @property {number} maxTeams - Максимальное количество команд
 * @property {Date} createdAt - Дата создания записи
 * @property {Date} updatedAt - Дата последнего обновления
 * 
 * @example
 * // Создание объекта турнира
 * const tournament: Tournament = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Летний кубок 2026",
 *   description: "Любительский футбольный турнир",
 *   startDate: new Date("2026-06-01"),
 *   endDate: new Date("2026-08-31"),
 *   format: TournamentFormat.LEAGUE,
 *   status: TournamentStatus.REGISTRATION,
 *   organizerId: "user-123",
 *   maxTeams: 16,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 */
export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  format: TournamentFormat;
  status: TournamentStatus;
  organizerId: string;
  maxTeams: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO для создания нового турнира
 * 
 * @interface CreateTournamentDto
 * @property {string} name - Название турнира
 * @property {Date} startDate - Дата начала
 * @property {Date} endDate - Дата окончания
 * @property {TournamentFormat} format - Формат проведения
 * @property {string} organizerId - ID организатора
 * @property {number} maxTeams - Максимум команд
 */
export interface CreateTournamentDto {
  name: string;
  startDate: Date;
  endDate: Date;
  format: TournamentFormat;
  organizerId: string;
  maxTeams: number;
}-
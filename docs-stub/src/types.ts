/**
 * @module types
 * @description Типы данных системы учёта турниров
 */

/**
 * Статусы турнира
 * @enum {string}
 */
export enum TournamentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  COMPLETED = "completed"
}

/**
 * Модель турнира
 * @interface
 */
export interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
}

/**
 * Сервис управления турнирами
 * @class
 */
export class TournamentService {
  /**
   * Создание турнира
   * @param name - Название
   * @returns Объект турнира
   */
  create(name: string): Tournament {
    return {} as Tournament;
  }
}
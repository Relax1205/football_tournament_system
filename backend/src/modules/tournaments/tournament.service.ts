// football_tournament_system/backend/src/modules/tournaments/tournament.service.ts
import { prisma } from '@common/prisma';
import { z } from 'zod';
import { TournamentStatus, TournamentFormat } from '@prisma/client';

export const createTournamentSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.nativeEnum(TournamentFormat),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export const updateTournamentSchema = createTournamentSchema.partial();
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;

/**
 * Сервис управления футбольными турнирами.
 * Реализует CRUD-операции для сущности Tournament.
 */
export class TournamentService {
   /**
   * Получить список всех турниров с возможностью фильтрации по статусу.
   * 
   * @param status - (Опционально) Статус турнира для фильтрации (DRAFT, IN_PROGRESS, и т.д.).
   * @returns Массив объектов турниров с дополнительными полями (_count: teams, matches).
   */
  static async getAll(status?: TournamentStatus) {
    const where = status ? { status } : {};
    return await prisma.tournament.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { teams: true, matches: true } },
      },
    });
  }

  /**
   * Получить подробную информацию о турнире по его ID.
   * Включает список команд и матчей.
   * 
   * @param id - Уникальный идентификатор турнира.
   * @returns Объект турнира или null, если не найден.
   */
  static async getById(id: string) {
    return await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { include: { _count: { select: { players: true } } } },
        matches: {
          include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
          },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  /**
   * Создать новый турнир.
   * Статус нового турнира автоматически устанавливается в DRAFT.
   * 
   * @param input - Данные для создания (название, даты, формат).
   * @returns Созданный объект турнира.
   * @throws {ZodError} Если входные данные не проходят валидацию.
   */
  static async create(input: CreateTournamentInput) {
    const validated = createTournamentSchema.parse(input);
    return await prisma.tournament.create({
      data: {
        name: validated.name,
        description: validated.description,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        format: validated.format,
        status: TournamentStatus.DRAFT,
      },
    });
  }

  /**
   * Обновить данные существующего турнира.
   * Позволяет частичное обновление полей.
   * 
   * @param id - ID обновляемого турнира.
   * @param input - Объект с полями для обновления.
   * @returns Обновленный объект турнира.
   * @throws {Error} Если турнир не найден.
   */
  static async update(id: string, input: UpdateTournamentInput) {
    const validated = updateTournamentSchema.parse(input);
    const updateData: any = {};
    
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.startDate !== undefined) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate !== undefined) updateData.endDate = new Date(validated.endDate);
    if (validated.format !== undefined) updateData.format = validated.format;

    return await prisma.tournament.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Удалить турнир.
   * Безопасное удаление: запрещено, если у турнира есть команды или матчи.
   * 
   * @param id - ID удаляемого турнира.
   * @returns Объект удаленного турнира.
   * @throws {Error} Если турнир имеет связанные данные.
   */
  static async delete(id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { _count: { select: { teams: true, matches: true } } },
    });

    if (!tournament) throw new Error('Турнир не найден');
    if (tournament._count.teams > 0 || tournament._count.matches > 0) {
      throw new Error('Невозможно удалить турнир с командами или матчами');
    }

    return await prisma.tournament.delete({ where: { id } });
  }

  /**
   * Изменить статус турнира (например, открыть регистрацию или завершить).
   * 
   * @param id - ID турнира.
   * @param status - Новый статус (из перечисления TournamentStatus).
   * @returns Обновленный объект турнира.
   */
  static async updateStatus(id: string, status: TournamentStatus) {
    // ВНИМАНИЕ: Ниже ключ "data" написан явно
    return await prisma.tournament.update({
      where: { id },
      data: { status },
    });
  }
}
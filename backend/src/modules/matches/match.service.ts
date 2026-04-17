// football_tournament_system/backend/src/modules/matches/match.service.ts
import { prisma } from '@common/prisma';
import { z } from 'zod';
import { MatchStatus } from '@prisma/client';

// Схема валидации для создания матча
export const createMatchSchema = z.object({
  tournamentId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  date: z.string().datetime(),
  refereeId: z.string().min(1).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

// Схема для обновления счёта
export const updateScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;

export class MatchService {
  /**
   * Получить список матчей с фильтрацией
   */
  static async getAll(tournamentId?: string) {
    const where = tournamentId ? { tournamentId } : {};

    return await prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        referee: { select: { id: true, name: true } },
        events: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Создать матч (добавить в расписание)
   */
  static async create(input: CreateMatchInput) {
    const validated = createMatchSchema.parse(input);

    // Валидация: домашняя и гостевая команды не могут совпадать
    if (validated.homeTeamId === validated.awayTeamId) {
      throw new Error('Команды в матче не могут совпадать');
    }

    // Проверка принадлежности команд к турниру
    const homeTeam = await prisma.team.findUnique({ where: { id: validated.homeTeamId } });
    const awayTeam = await prisma.team.findUnique({ where: { id: validated.awayTeamId } });

    if (!homeTeam || homeTeam.tournamentId !== validated.tournamentId) {
      throw new Error('Домашняя команда не принадлежит этому турниру');
    }
    if (!awayTeam || awayTeam.tournamentId !== validated.tournamentId) {
      throw new Error('Гостевая команда не принадлежит этому турниру');
    }

    return await prisma.match.create({
    data: {
        date: new Date(validated.date),
        status: MatchStatus.SCHEDULED,
        tournamentId: validated.tournamentId,
        homeTeamId: validated.homeTeamId,
        awayTeamId: validated.awayTeamId,
        refereeId: validated.refereeId || null,
      },
    });
  }

  /**
   * Обновить счёт матча
   */
  static async updateScore(matchId: string, input: UpdateScoreInput) {
    const validated = updateScoreSchema.parse(input);

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Матч не найден');
    if (match.status === MatchStatus.CONFIRMED) {
      throw new Error('Нельзя изменить результат подтверждённого матча');
    }

    return await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: validated.homeScore,
        awayScore: validated.awayScore,
        status: MatchStatus.AWAITING_CONFIRMATION, // Статус меняется на "Ожидает подтверждения"
      },
    });
  }

  /**
   * Подтвердить результат (для организатора)
   */
  static async confirmMatch(matchId: string) {
    return await prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.CONFIRMED },
    });
  }

  /**
   * Удалить матч
   */
  static async delete(matchId: string) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Матч не найден');
    
    // Удаление событий матча (голы и т.д.) произойдёт автоматически благодаря Cascade Delete
    return await prisma.match.delete({ where: { id: matchId } });
  }
}
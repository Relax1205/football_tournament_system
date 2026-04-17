// football_tournament_system/backend/src/modules/standings/standings.service.ts
import { prisma } from '@common/prisma';
import { MatchStatus } from '@prisma/client';

/**
 * Сервис расчёта турнирных таблиц.
 * Реализует бизнес-логику подсчета очков и сортировки команд
 * согласно регламенту (правила ФИФА).
 */
export class StandingsService {
    /**
   * Рассчитать турнирную таблицу для конкретного турнира.
   * 
   * Алгоритм сортировки (Приоритет убывания):
   * 1. Количество очков.
   * 2. Разница забитых и пропущенных голов.
   * 3. Количество забитых голов.
   * 
   * @param tournamentId - Идентификатор турнира.
   * @returns Массив рассчитанных позиций команд.
   * @throws {Error} Если турнир не найден или нет данных.
   */
  static async calculate(tournamentId: string) {
    const teams = await prisma.team.findMany({
      where: { tournamentId },
      select: { id: true, name: true },
    });

    if (teams.length === 0) {
      return { message: 'В турнире нет команд' };
    }

    const matches = await prisma.match.findMany({
      where: {
        tournamentId,
        status: MatchStatus.CONFIRMED,
      },
    });

    const stats: Record<string, any> = {};
    teams.forEach((team) => {
      stats[team.id] = {
        teamId: team.id,
        points: 0,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      };
    });

    matches.forEach((match) => {
      const home = stats[match.homeTeamId];
      const away = stats[match.awayTeamId];

      if (!home || !away) return;

      home.gamesPlayed++;
      away.gamesPlayed++;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.points += 3;
        home.wins++;
        away.losses++;
      } else if (match.homeScore < match.awayScore) {
        away.points += 3;
        away.wins++;
        home.losses++;
      } else {
        home.points += 1;
        away.points += 1;
        home.draws++;
        away.draws++;
      }
    });

    Object.values(stats).forEach((s) => {
      s.goalDifference = s.goalsFor - s.goalsAgainst;
    });

    const sortedStats = Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Транзакция для атомарного обновления таблицы
    await prisma.$transaction(async (tx) => {
      await tx.tournamentStanding.deleteMany({
        where: { tournamentId },
      });

      const standingsToCreate = sortedStats.map((stat: any) => ({
        tournamentId,
        teamId: stat.teamId,
        points: stat.points,
        gamesPlayed: stat.gamesPlayed,
        wins: stat.wins,
        draws: stat.draws,
        losses: stat.losses,
        goalsFor: stat.goalsFor,
        goalsAgainst: stat.goalsAgainst,
        goalDifference: stat.goalDifference,
      }));

      if (standingsToCreate.length > 0) {
        await tx.tournamentStanding.createMany({
          data: standingsToCreate,
        });
      }
    });

    return sortedStats;
  }

  /**
   * Получить текущую (сохраненную) турнирную таблицу.
   * 
   * @param tournamentId - Идентификатор турнира.
   * @returns Массив записей таблицы с данными команд.
   */
  static async getStandings(tournamentId: string) {
    return await prisma.tournamentStanding.findMany({
      where: { tournamentId },
      include: {
        team: { select: { id: true, name: true } },
      },
      orderBy: { points: 'desc' },
    });
  }
}
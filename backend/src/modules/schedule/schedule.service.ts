// football_tournament_system/backend/src/modules/schedule/schedule.service.ts
import { prisma } from '@common/prisma';
import { MatchStatus } from '@prisma/client';

/**
 * Сервис генерации расписания матчей.
 * Реализует алгоритм круговой системы (каждый с каждым).
 */
export class ScheduleService {
    /**
     * Генерация расписания по круговой системе.
     * Если команд нечетное количество, добавляется виртуальный "BYE" (технический проигрыш/отдых).
     * 
     * @param tournamentId - ID турнира, для которого создается расписание.
     * @param startDate - Дата начала первого тура (ISO строка).
     * @param daysBetweenRounds - Количество дней между турами (по умолчанию 7).
     * @returns Массив созданных матчей.
     * @throws {Error} Если в турнире менее 2 команд.
     */
    static async generateRoundRobin(tournamentId: string, startDate: string, daysBetweenRounds: number = 7) {
        const teams = await prisma.team.findMany({
        where: { tournamentId },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        });

    if (teams.length < 2) {
      throw new Error('Для генерации расписания необходимо минимум 2 команды');
    }

    await prisma.match.deleteMany({ where: { tournamentId } });

    const teamIds = teams.map((t) => t.id);
    const n = teamIds.length;
    const isOdd = n % 2 !== 0;
    const virtualTeams = isOdd ? [...teamIds, 'BYE'] : teamIds;
    const numRounds = virtualTeams.length - 1;
    const matchesPerRound = virtualTeams.length / 2;

    const schedule: { homeTeamId: string; awayTeamId: string }[] = [];
    const fixedTeam = virtualTeams[0];
    const rotatingTeams = virtualTeams.slice(1);

    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = i === 0 ? fixedTeam : rotatingTeams[i - 1];
        const away = rotatingTeams[rotatingTeams.length - 1 - i];

        if (home !== 'BYE' && away !== 'BYE') {
          if (round % 2 === 0) {
            schedule.push({ homeTeamId: home, awayTeamId: away });
          } else {
            schedule.push({ homeTeamId: away, awayTeamId: home });
          }
        }
      }
      rotatingTeams.push(rotatingTeams.shift()!);
    }

    let currentDate = new Date(startDate);
    const createdMatches = [];

    for (const match of schedule) {
      const newMatch = await prisma.match.create({
        data: {
          tournamentId,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          date: new Date(currentDate),
          status: MatchStatus.SCHEDULED,
        },
      });
      createdMatches.push(newMatch);
      currentDate.setDate(currentDate.getDate() + daysBetweenRounds);
    }

    return createdMatches;
  }
}
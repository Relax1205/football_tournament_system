import { MatchStatus } from '@prisma/client';
import { prisma } from '../../common/prisma';

type Pairing = {
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
};

export class ScheduleService {
  static async generateRoundRobin(tournamentId: string, startDate: string, daysBetweenRounds = 7) {
    const teams = await prisma.team.findMany({
      where: { tournamentId },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (teams.length < 2) {
      throw new Error('At least two teams are required to generate a schedule');
    }

    const ids = teams.map((team) => team.id);
    const rotation = ids.length % 2 === 0 ? [...ids] : [...ids, 'BYE'];
    const rounds = rotation.length - 1;
    const matchesPerRound = rotation.length / 2;
    const fixed = rotation[0];
    const moving = rotation.slice(1);
    const pairings: Pairing[] = [];
    let currentDate = new Date(startDate);

    for (let round = 0; round < rounds; round += 1) {
      for (let index = 0; index < matchesPerRound; index += 1) {
        const left = index === 0 ? fixed : moving[index - 1];
        const right = moving[moving.length - 1 - index];

        if (left === 'BYE' || right === 'BYE') {
          continue;
        }

        const homeTeamId = round % 2 === 0 ? left : right;
        const awayTeamId = round % 2 === 0 ? right : left;

        pairings.push({
          homeTeamId,
          awayTeamId,
          date: new Date(currentDate),
        });
      }

      moving.unshift(moving.pop()!);
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + daysBetweenRounds);
    }

    await prisma.match.createMany({
      data: pairings.map((pairing) => ({
        tournamentId,
        homeTeamId: pairing.homeTeamId,
        awayTeamId: pairing.awayTeamId,
        date: pairing.date,
        status: MatchStatus.SCHEDULED,
      })),
    });

    return prisma.match.findMany({
      where: { tournamentId },
      include: {
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}

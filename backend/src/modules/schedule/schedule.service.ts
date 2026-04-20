import { MatchStatus } from '@prisma/client';
import { HttpError } from '../../common/http-error';
import { prisma } from '../../common/prisma';

type Pairing = {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: Date;
};

export class ScheduleService {
  private static createPairKey(homeTeamId: string, awayTeamId: string) {
    return [homeTeamId, awayTeamId].sort().join(':');
  }

  private static createTeamSlotKey(teamId: string, date: Date) {
    return `${teamId}:${date.toISOString()}`;
  }

  private static formatMatchLabel(homeTeamName: string, awayTeamName: string) {
    return `"${homeTeamName} vs ${awayTeamName}"`;
  }

  static async generateRoundRobin(tournamentId: string, startDate: string, daysBetweenRounds = 7) {
    const teams = await prisma.team.findMany({
      where: { tournamentId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (teams.length < 2) {
      throw new Error('At least two teams are required to generate a schedule');
    }

    const teamById = new Map(teams.map((team) => [team.id, team]));
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
        const homeTeam = teamById.get(homeTeamId);
        const awayTeam = teamById.get(awayTeamId);

        if (!homeTeam || !awayTeam) {
          throw new Error('Unable to resolve teams for schedule generation');
        }

        pairings.push({
          homeTeamId,
          awayTeamId,
          homeTeamName: homeTeam.name,
          awayTeamName: awayTeam.name,
          date: new Date(currentDate),
        });
      }

      moving.unshift(moving.pop()!);
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + daysBetweenRounds);
    }

    const existingMatches = await prisma.match.findMany({
      where: {
        tournamentId,
        status: {
          not: MatchStatus.CANCELLED,
        },
      },
      select: {
        date: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: {
          select: { name: true },
        },
        awayTeam: {
          select: { name: true },
        },
      },
    });

    const existingPairings = new Set(
      existingMatches.map((match) => this.createPairKey(match.homeTeamId, match.awayTeamId)),
    );
    const occupiedSlots = new Set<string>();

    for (const match of existingMatches) {
      occupiedSlots.add(this.createTeamSlotKey(match.homeTeamId, match.date));
      occupiedSlots.add(this.createTeamSlotKey(match.awayTeamId, match.date));
    }

    for (const pairing of pairings) {
      const pairKey = this.createPairKey(pairing.homeTeamId, pairing.awayTeamId);
      const matchLabel = this.formatMatchLabel(pairing.homeTeamName, pairing.awayTeamName);

      if (existingPairings.has(pairKey)) {
        throw new HttpError(
          409,
          `Schedule conflict: match ${matchLabel} already exists in this tournament`,
        );
      }

      for (const teamId of [pairing.homeTeamId, pairing.awayTeamId]) {
        const slotKey = this.createTeamSlotKey(teamId, pairing.date);

        if (occupiedSlots.has(slotKey)) {
          throw new HttpError(
            409,
            `Schedule conflict: one of the teams already has a match at ${pairing.date.toISOString()}`,
          );
        }

        occupiedSlots.add(slotKey);
      }

      existingPairings.add(pairKey);
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

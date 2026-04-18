import { MatchStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { StandingsService } from '../standings/standings.service';

export const createMatchSchema = z.object({
  tournamentId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  refereeId: z.string().min(1).optional(),
  venue: z.string().trim().optional(),
  date: z.string().datetime(),
});

export const updateScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export class MatchService {
  static async getAll(tournamentId?: string) {
    return prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        tournament: {
          select: { id: true, name: true },
        },
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
        referee: {
          select: { id: true, name: true, email: true },
        },
        events: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                number: true,
                teamId: true,
              },
            },
          },
          orderBy: { minute: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  static async create(input: z.infer<typeof createMatchSchema>) {
    const payload = createMatchSchema.parse(input);

    if (payload.homeTeamId === payload.awayTeamId) {
      throw new Error('Teams in a match must be different');
    }

    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: payload.homeTeamId } }),
      prisma.team.findUnique({ where: { id: payload.awayTeamId } }),
    ]);

    if (!homeTeam || homeTeam.tournamentId !== payload.tournamentId) {
      throw new Error('Home team does not belong to this tournament');
    }

    if (!awayTeam || awayTeam.tournamentId !== payload.tournamentId) {
      throw new Error('Away team does not belong to this tournament');
    }

    return prisma.match.create({
      data: {
        tournamentId: payload.tournamentId,
        homeTeamId: payload.homeTeamId,
        awayTeamId: payload.awayTeamId,
        refereeId: payload.refereeId ?? null,
        venue: payload.venue,
        date: new Date(payload.date),
      },
    });
  }

  static async updateScore(matchId: string, input: z.infer<typeof updateScoreSchema>) {
    const payload = updateScoreSchema.parse(input);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status === MatchStatus.CONFIRMED) {
      throw new Error('Confirmed matches cannot be edited');
    }

    return prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: payload.homeScore,
        awayScore: payload.awayScore,
        status: MatchStatus.AWAITING_CONFIRMATION,
      },
      include: {
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
        referee: {
          select: { id: true, name: true, email: true },
        },
        events: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                number: true,
                teamId: true,
              },
            },
          },
          orderBy: { minute: 'asc' },
        },
      },
    });
  }

  static async confirmMatch(matchId: string) {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.CONFIRMED,
      },
    });

    await StandingsService.calculate(match.tournamentId);

    return prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
        referee: {
          select: { id: true, name: true, email: true },
        },
        events: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                number: true,
                teamId: true,
              },
            },
          },
          orderBy: { minute: 'asc' },
        },
      },
    });
  }

  static async delete(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return prisma.match.delete({
      where: { id: matchId },
    });
  }
}

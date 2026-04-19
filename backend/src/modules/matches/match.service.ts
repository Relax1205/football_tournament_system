import { MatchStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { NotificationService } from '../notifications/notification.service';
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

  static async updateScore(
    matchId: string,
    input: z.infer<typeof updateScoreSchema>,
    actorUserId?: string,
  ) {
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

    const updatedMatch = await prisma.match.update({
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

    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.ORGANIZER],
        },
        ...(actorUserId ? { id: { not: actorUserId } } : {}),
      },
      select: {
        id: true,
      },
    });

    await NotificationService.createForUsers(
      reviewers.map((user) => user.id),
      {
        title: 'Результат матча ждёт подтверждения',
        message: `Матч "${updatedMatch.homeTeam.name} - ${updatedMatch.awayTeam.name}" обновлён со счётом ${updatedMatch.homeScore}:${updatedMatch.awayScore}.`,
        kind: 'info',
      },
    );

    return updatedMatch;
  }

  static async confirmMatch(matchId: string, actorUserId?: string) {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.CONFIRMED,
      },
    });

    const confirmedMatch = await prisma.match.findUnique({
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

    if (!confirmedMatch) {
      throw new Error('Match not found');
    }

    await StandingsService.calculate(confirmedMatch.tournamentId);

    if (confirmedMatch.referee?.id && confirmedMatch.referee.id !== actorUserId) {
      await NotificationService.createForUser(confirmedMatch.referee.id, {
        title: 'Результат подтверждён',
        message: `Организатор подтвердил результат матча "${confirmedMatch.homeTeam.name} - ${confirmedMatch.awayTeam.name}". Итоговый счёт: ${confirmedMatch.homeScore}:${confirmedMatch.awayScore}.`,
        kind: 'success',
      });
    }

    return confirmedMatch;
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

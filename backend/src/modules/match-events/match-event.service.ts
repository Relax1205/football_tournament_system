import { EventType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';

export const createEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z.string().min(1),
  type: z.nativeEnum(EventType),
  minute: z.number().int().min(1).max(120),
  comment: z.string().trim().optional(),
});

export class MatchEventService {
  static async create(input: z.infer<typeof createEventSchema>) {
    const payload = createEventSchema.parse(input);

    const match = await prisma.match.findUnique({
      where: { id: payload.matchId },
    });
    if (!match) {
      throw new Error('Match not found');
    }

    const player = await prisma.player.findUnique({
      where: { id: payload.playerId },
    });
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.teamId !== match.homeTeamId && player.teamId !== match.awayTeamId) {
      throw new Error('Player does not belong to this match');
    }

    return prisma.matchEvent.create({
      data: {
        matchId: payload.matchId,
        playerId: payload.playerId,
        type: payload.type,
        minute: payload.minute,
        comment: payload.comment,
      },
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
    });
  }

  static async getByMatchId(matchId: string) {
    return prisma.matchEvent.findMany({
      where: { matchId },
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
    });
  }

  static async delete(eventId: string) {
    return prisma.matchEvent.delete({
      where: { id: eventId },
    });
  }
}

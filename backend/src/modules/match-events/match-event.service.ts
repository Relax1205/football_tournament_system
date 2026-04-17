// football_tournament_system/backend/src/modules/match-events/match-event.service.ts
import { prisma } from '@common/prisma';
import { z } from 'zod';
import { EventType } from '@prisma/client';

export const createEventSchema = z.object({
  matchId: z.string().min(1, 'ID матча обязателен'),
  playerId: z.string().min(1, 'ID игрока обязателен'),
  type: z.nativeEnum(EventType),
  minute: z.number().int().min(1).max(120),
  comment: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export class MatchEventService {
  static async create(input: CreateEventInput) {
    const validated = createEventSchema.parse(input);

    const match = await prisma.match.findUnique({ where: { id: validated.matchId } });
    if (!match) throw new Error('Матч не найден');

    const player = await prisma.player.findUnique({ where: { id: validated.playerId } });
    if (!player) throw new Error('Игрок не найден');

    if (player.teamId !== match.homeTeamId && player.teamId !== match.awayTeamId) {
      throw new Error('Игрок не участвует в этом матче');
    }

    // ИСПРАВЛЕНО: добавлен ключ "data"
    return await prisma.matchEvent.create({
       data: {
        matchId: validated.matchId,
        playerId: validated.playerId,
        type: validated.type,
        minute: validated.minute,
        comment: validated.comment,
      },
    });
  }

  static async getByMatchId(matchId: string) {
    return await prisma.matchEvent.findMany({
      where: { matchId },
      include: {
        player: { select: { id: true, firstName: true, lastName: true, number: true } },
      },
      orderBy: { minute: 'asc' },
    });
  }

  static async delete(eventId: string) {
    return await prisma.matchEvent.delete({ where: { id: eventId } });
  }
}
import { EventType, MatchStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { HttpError } from '../../common/http-error';
import { prisma } from '../../common/prisma';

export const createEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z.string().min(1),
  type: z.nativeEnum(EventType),
  minute: z.number().int().min(1).max(120),
  comment: z.string().trim().optional(),
});

type MatchEventActor = {
  role: Role;
  userId: string;
};

export class MatchEventService {
  private static ensureMatchEditable(match: { status: MatchStatus }) {
    if (match.status === MatchStatus.CONFIRMED) {
      throw new HttpError(409, 'Confirmed matches cannot be edited');
    }

    if (match.status === MatchStatus.CANCELLED) {
      throw new HttpError(409, 'Cancelled matches cannot be edited');
    }
  }

  private static ensureActorCanEdit(
    match: { refereeId: string | null },
    actor?: MatchEventActor,
  ) {
    if (!actor || actor.role !== Role.REFEREE) {
      return;
    }

    if (match.refereeId !== actor.userId) {
      throw new HttpError(403, 'Referees can only edit matches assigned to them');
    }
  }

  static async create(
    input: z.infer<typeof createEventSchema>,
    actor?: MatchEventActor,
  ) {
    const payload = createEventSchema.parse(input);

    const match = await prisma.match.findUnique({
      where: { id: payload.matchId },
      select: {
        id: true,
        status: true,
        refereeId: true,
        homeTeamId: true,
        awayTeamId: true,
      },
    });
    if (!match) {
      throw new HttpError(404, 'Match not found');
    }

    this.ensureMatchEditable(match);
    this.ensureActorCanEdit(match, actor);

    const player = await prisma.player.findUnique({
      where: { id: payload.playerId },
    });
    if (!player) {
      throw new HttpError(404, 'Player not found');
    }

    if (player.teamId !== match.homeTeamId && player.teamId !== match.awayTeamId) {
      throw new HttpError(400, 'Player does not belong to this match');
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

  static async delete(eventId: string, actor?: MatchEventActor) {
    const event = await prisma.matchEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        match: {
          select: {
            status: true,
            refereeId: true,
          },
        },
      },
    });

    if (!event) {
      throw new HttpError(404, 'Event not found');
    }

    this.ensureMatchEditable(event.match);
    this.ensureActorCanEdit(event.match, actor);

    return prisma.matchEvent.delete({
      where: { id: eventId },
    });
  }
}

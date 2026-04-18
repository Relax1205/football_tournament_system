import { EventType } from '@prisma/client';
import { prisma } from '../../common/prisma';

export class PlayerService {
  static async getAll(tournamentId?: string, teamId?: string) {
    const players = await prisma.player.findMany({
      where: {
        ...(teamId ? { teamId } : {}),
        ...(tournamentId ? { team: { tournamentId } } : {}),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            tournamentId: true,
          },
        },
        events: {
          select: {
            type: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return players.map((player) => {
      const goals = player.events.filter((event) => event.type === EventType.GOAL).length;
      const yellowCards = player.events.filter((event) => event.type === EventType.YELLOW_CARD).length;
      const redCards = player.events.filter((event) => event.type === EventType.RED_CARD).length;

      return {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        number: player.number,
        team: player.team,
        goals,
        yellowCards,
        redCards,
      };
    });
  }
}

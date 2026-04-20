import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';

export const createTeamSchema = z.object({
  name: z.string().trim().min(3),
  city: z.string().trim().optional(),
  tournamentId: z.string().min(1),
  coachId: z.string().min(1).optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(3).optional(),
  city: z.string().trim().optional(),
  coachId: z.string().min(1).optional().nullable(),
});

export const addPlayerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  number: z.number().int().min(1).max(99).optional(),
});

export class TeamService {
  static async getAll(tournamentId?: string) {
    return prisma.team.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        players: {
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' },
          ],
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' },
          ],
        },
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async create(input: z.infer<typeof createTeamSchema>) {
    const payload = createTeamSchema.parse(input);

    const tournament = await prisma.tournament.findUnique({
      where: { id: payload.tournamentId },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return prisma.team.create({
      data: {
        name: payload.name,
        city: payload.city,
        tournamentId: payload.tournamentId,
        coachId: payload.coachId ?? null,
      },
    });
  }

  static async update(id: string, input: z.infer<typeof updateTeamSchema>) {
    const payload = updateTeamSchema.parse(input);

    return prisma.team.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.city !== undefined ? { city: payload.city } : {}),
        ...(payload.coachId !== undefined ? { coachId: payload.coachId } : {}),
      },
    });
  }

  static async delete(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const totalMatches = team._count.homeMatches + team._count.awayMatches;
    if (totalMatches > 0) {
      throw new Error('Team cannot be deleted after matches have been scheduled');
    }

    return prisma.team.delete({
      where: { id },
    });
  }

  static async addPlayer(
    teamId: string,
    input: z.infer<typeof addPlayerSchema>,
    actor?: { role: Role; userId: string },
  ) {
    const payload = addPlayerSchema.parse(input);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        coachId: true,
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    if (actor?.role === Role.COACH && team.coachId !== actor.userId) {
      throw new Error('Coaches can only manage their own teams');
    }

    return prisma.player.create({
      data: {
        teamId: team.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        number: payload.number,
      },
    });
  }
}

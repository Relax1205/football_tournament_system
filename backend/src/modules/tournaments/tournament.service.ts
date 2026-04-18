import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';

const baseTournamentSchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.nativeEnum(TournamentFormat),
  groups: z.number().int().min(1).max(8).default(1),
  status: z.nativeEnum(TournamentStatus).optional(),
});

export const createTournamentSchema = baseTournamentSchema.superRefine((value, context) => {
  if (new Date(value.endDate) < new Date(value.startDate)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'endDate must be greater than or equal to startDate',
    });
  }
});

export const updateTournamentSchema = baseTournamentSchema.partial().superRefine((value, context) => {
  if (value.startDate && value.endDate && new Date(value.endDate) < new Date(value.startDate)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'endDate must be greater than or equal to startDate',
    });
  }
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;

export class TournamentService {
  static async getAll(status?: TournamentStatus) {
    return prisma.tournament.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
            applications: true,
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            _count: {
              select: { players: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        matches: {
          include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            referee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { date: 'asc' },
        },
        standings: {
          include: {
            team: { select: { id: true, name: true } },
          },
          orderBy: [
            { points: 'desc' },
            { goalDifference: 'desc' },
            { goalsFor: 'desc' },
          ],
        },
        applications: {
          orderBy: { createdAt: 'desc' },
          include: {
            applicant: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
  }

  static async create(input: CreateTournamentInput) {
    const payload = createTournamentSchema.parse(input);

    return prisma.tournament.create({
      data: {
        name: payload.name,
        description: payload.description,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        format: payload.format,
        groups: payload.groups,
        status: payload.status ?? TournamentStatus.REGISTRATION_OPEN,
      },
    });
  }

  static async update(id: string, input: UpdateTournamentInput) {
    const payload = updateTournamentSchema.parse(input);

    return prisma.tournament.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.startDate !== undefined ? { startDate: new Date(payload.startDate) } : {}),
        ...(payload.endDate !== undefined ? { endDate: new Date(payload.endDate) } : {}),
        ...(payload.format !== undefined ? { format: payload.format } : {}),
        ...(payload.groups !== undefined ? { groups: payload.groups } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
      },
    });
  }

  static async delete(id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
            applications: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament._count.teams > 0 || tournament._count.matches > 0 || tournament._count.applications > 0) {
      throw new Error('Tournament cannot be deleted while linked records exist');
    }

    return prisma.tournament.delete({
      where: { id },
    });
  }

  static async updateStatus(id: string, status: TournamentStatus) {
    return prisma.tournament.update({
      where: { id },
      data: { status },
    });
  }
}

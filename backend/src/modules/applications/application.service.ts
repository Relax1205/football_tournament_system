import { ApplicationStatus, Role, TournamentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../common/prisma';

export const createApplicationSchema = z.object({
  tournamentId: z.string().min(1),
  teamName: z.string().trim().min(2),
  city: z.string().trim().min(2),
  coachName: z.string().trim().min(4),
  playersCount: z.number().int().min(7).max(30),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export class ApplicationService {
  static async getAll(tournamentId?: string, applicantId?: string) {
    return prisma.application.findMany({
      where: {
        ...(tournamentId ? { tournamentId } : {}),
        ...(applicantId ? { applicantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tournament: {
          select: { id: true, name: true },
        },
        applicant: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
  }

  static async create(applicantId: string, input: z.infer<typeof createApplicationSchema>) {
    const payload = createApplicationSchema.parse(input);

    const tournament = await prisma.tournament.findUnique({
      where: { id: payload.tournamentId },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new Error('Applications are available only for tournaments with open registration');
    }

    return prisma.application.create({
      data: {
        tournamentId: payload.tournamentId,
        teamName: payload.teamName,
        city: payload.city,
        coachName: payload.coachName,
        playersCount: payload.playersCount,
        applicantId,
      },
      include: {
        tournament: {
          select: { id: true, name: true },
        },
        applicant: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
  }

  static async updateStatus(applicationId: string, status: ApplicationStatus) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: { id: true, role: true },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (status !== ApplicationStatus.APPROVED || application.approvedTeamId) {
      return prisma.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
          tournament: {
            select: { id: true, name: true },
          },
          applicant: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      });
    }

    return prisma.$transaction(async (transaction) => {
      const existingTeam = await transaction.team.findFirst({
        where: {
          tournamentId: application.tournamentId,
          name: application.teamName,
        },
      });

      const team = existingTeam ?? await transaction.team.create({
        data: {
          tournamentId: application.tournamentId,
          name: application.teamName,
          city: application.city ?? undefined,
          coachId: application.applicant.role === Role.COACH ? application.applicant.id : null,
        },
      });

      return transaction.application.update({
        where: { id: applicationId },
        data: {
          status,
          approvedTeamId: team.id,
        },
        include: {
          tournament: {
            select: { id: true, name: true },
          },
          applicant: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      });
    });
  }
}

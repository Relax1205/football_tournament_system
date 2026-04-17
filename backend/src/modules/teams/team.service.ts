// football_tournament_system/backend/src/modules/teams/team.service.ts
import { prisma } from '@common/prisma';
import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3, 'Название команды должно содержать минимум 3 символа'),
  city: z.string().optional(),
  tournamentId: z.string().min(1, 'Некорректный ID турнира'),
  coachId: z.string().min(1).optional().nullable(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().min(3).optional(),
  city: z.string().optional(),
  tournamentId: z.string().min(1, 'ID турнира обязателен'),
  coachId: z.string().min(1).optional().nullable(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export class TeamService {
  static async getAll(tournamentId?: string) {
    const where = tournamentId ? { tournamentId } : {};
    return await prisma.team.findMany({
      where,
      include: { players: true, coach: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.team.findUnique({
      where: { id },
      include: { players: true, tournament: { select: { id: true, name: true } } },
    });
  }

  static async create(input: CreateTeamInput) {
    const validated = createTeamSchema.parse(input);

    const tournament = await prisma.tournament.findUnique({ where: { id: validated.tournamentId } });
    if (!tournament) {
      throw new Error('Турнир не найден');
    }

    return await prisma.team.create({
      data: {
        name: validated.name,
        city: validated.city,
        tournamentId: validated.tournamentId,
        coachId: validated.coachId || null,
      },
    });
  }

  static async update(id: string, input: UpdateTeamInput) {
    const validated = updateTeamSchema.parse(input);
    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.city !== undefined) updateData.city = validated.city;
    if (validated.coachId !== undefined) updateData.coachId = validated.coachId;

    // ИСПРАВЛЕНО: ключ "data" добавлен явно
    return await prisma.team.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    // ИСПРАВЛЕНО: считаем матчи через homeMatches и awayMatches
    const team = await prisma.team.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { 
            homeMatches: true, 
            awayMatches: true 
          } 
        } 
      },
    });
    
    if (!team) throw new Error('Команда не найдена');
    
    // ИСПРАВЛЕНО: суммируем домашние и гостевые матчи
    const totalMatches = (team._count?.homeMatches || 0) + (team._count?.awayMatches || 0);
    if (totalMatches > 0) {
      throw new Error('Невозможно удалить команду, у которой уже есть матчи.');
    }
    
    return await prisma.team.delete({ where: { id } });
  }

  static async addPlayer(teamId: string, playerData: { firstName: string; lastName: string; number?: number }) {
    return await prisma.player.create({
      data: {
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        number: playerData.number,
        teamId: teamId,
      },
    });
  }
}
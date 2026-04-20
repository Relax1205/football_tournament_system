import { Role } from '@prisma/client';
import { prisma } from '../../common/prisma';
import { NotificationService } from '../notifications/notification.service';

const roleLabels: Record<Role, string> = {
  ADMIN: 'Администратор',
  ORGANIZER: 'Организатор',
  REFEREE: 'Судья',
  COACH: 'Тренер',
  PLAYER: 'Игрок',
  VIEWER: 'Игрок / Болельщик',
};

export class UserService {
  static async getAll(role?: Role) {
    return prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async updateRole(userId: string, role: Role) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await NotificationService.createForUser(user.id, {
      title: 'Роль обновлена',
      message: `Теперь ваша роль — ${roleLabels[role]}. Для применения новых прав может потребоваться повторный вход.`,
      kind: 'success',
    });

    return user;
  }

  static async delete(userId: string, actorUserId: string) {
    if (userId === actorUserId) {
      throw new Error('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === Role.ADMIN) {
      const adminsCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminsCount <= 1) {
        throw new Error('Cannot delete the last administrator');
      }
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.application.deleteMany({
        where: {
          applicantId: userId,
        },
      });

      await transaction.user.delete({
        where: { id: userId },
      });
    });

    return user;
  }
}

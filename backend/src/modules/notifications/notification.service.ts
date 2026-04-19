import { Role } from '@prisma/client';
import { prisma } from '../../common/prisma';

type NotificationInput = {
  kind?: string;
  message: string;
  title: string;
};

export class NotificationService {
  static async getAllForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async createForUser(userId: string, input: NotificationInput) {
    return prisma.notification.create({
      data: {
        userId,
        title: input.title,
        message: input.message,
        kind: input.kind ?? 'info',
      },
    });
  }

  static async createForUsers(userIds: string[], input: NotificationInput) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

    if (uniqueUserIds.length === 0) {
      return { count: 0 };
    }

    return prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        title: input.title,
        message: input.message,
        kind: input.kind ?? 'info',
      })),
    });
  }

  static async createForRoles(roles: Role[], input: NotificationInput) {
    if (roles.length === 0) {
      return { count: 0 };
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
      },
      select: {
        id: true,
      },
    });

    return this.createForUsers(
      users.map((user) => user.id),
      input,
    );
  }

  static async markRead(userId: string, notificationId: string) {
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  static async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async delete(userId: string, notificationId: string) {
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new Error('Notification not found');
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}

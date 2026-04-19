import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../common/prisma';
import { config } from '../../config';
import { NotificationService } from '../notifications/notification.service';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: 'VIEWER',
      },
    });

    const displayName = user.name?.trim() || user.email;
    await Promise.all([
      NotificationService.createForUser(user.id, {
        title: 'Добро пожаловать',
        message:
          'Аккаунт создан. Сейчас у вас роль "Игрок / Болельщик". Администратор может выдать расширенные права в панели ролей.',
        kind: 'success',
      }),
      NotificationService.createForRoles([Role.ADMIN], {
        title: 'Новая регистрация',
        message: `Пользователь ${displayName} зарегистрировался в системе. При необходимости назначьте ему роль.`,
        kind: 'info',
      }),
    ]);

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
    };
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
      },
    };
  }
}

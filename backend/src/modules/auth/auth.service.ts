// football_tournament_system/backend/src/modules/auth/auth.service.ts
import { prisma } from '@common/prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@config/index';

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

/**
 * Сервис аутентификации и управления пользователями.
 * Реализует регистрацию, вход и генерацию JWT токенов.
 * Обеспечивает хэширование паролей (bcrypt, cost >= 12).
 */
export class AuthService {
  /**
   * Регистрация нового пользователя в системе.
   * Проверяет уникальность email и хэширует пароль перед сохранением.
   * 
   * @param input - Данные для регистрации (email, password, name).
   * @returns Объект пользователя без поля password.
   * @throws {Error} Если пользователь с таким email уже существует.
   * 
   * @example
   * await AuthService.register({ email: "user@test.com", password: "12345678", name: "Ivan" });
   */
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('Пользователь с таким email уже существует');
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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Аутентификация пользователя и выдача JWT токена.
   * 
   * @param input - Учетные данные (email, password).
   * @returns Объект, содержащий токен доступа и данные пользователя.
   * @throws {Error} Если логин или пароль неверны.
   */
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

    // ИСПРАВЛЕНО: явное приведение типов для совместимости с @types/jsonwebtoken
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
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
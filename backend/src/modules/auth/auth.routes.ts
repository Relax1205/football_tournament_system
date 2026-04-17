// football_tournament_system/backend/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthService } from './auth.service';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const user = await AuthService.register(validated);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.login(validated);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

export = router;
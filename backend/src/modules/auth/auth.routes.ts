import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (request, response) => {
  try {
    const payload = registerSchema.parse(request.body);
    const user = await AuthService.register(payload);

    response.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', async (request, response) => {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await AuthService.login(payload);

    response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error && error.message === 'Invalid credentials') {
      return response.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    response.status(500).json({ success: false, error: 'Login failed' });
  }
});

export = router;

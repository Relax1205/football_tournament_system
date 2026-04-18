import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import { StandingsService } from './standings.service';

const router = Router();

router.get('/', async (request, response) => {
  try {
    const schema = z.object({
      tournamentId: z.string().min(1),
    });
    const payload = schema.parse(request.query);
    const standings = await StandingsService.getStandings(payload.tournamentId);

    response.json({ success: true, data: standings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'tournamentId is required' });
    }

    response.status(500).json({ success: false, error: 'Unable to load standings' });
  }
});

router.post('/calculate', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const schema = z.object({
      tournamentId: z.string().min(1),
    });
    const payload = schema.parse(request.body);
    const standings = await StandingsService.calculate(payload.tournamentId);

    response.json({ success: true, data: standings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to calculate standings' });
  }
});

export = router;

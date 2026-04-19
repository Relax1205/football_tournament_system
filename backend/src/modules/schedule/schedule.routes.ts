import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { getErrorStatusCode } from '../../common/http-error';
import { authenticate, requireRoles } from '../../middleware/auth';
import { ScheduleService } from './schedule.service';

const router = Router();

router.post('/generate', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const schema = z.object({
      tournamentId: z.string().min(1),
      startDate: z.string().datetime(),
      daysBetweenRounds: z.number().int().min(1).default(7),
    });
    const payload = schema.parse(request.body);

    const matches = await ScheduleService.generateRoundRobin(
      payload.tournamentId,
      payload.startDate,
      payload.daysBetweenRounds,
    );

    response.status(201).json({ success: true, data: matches });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(getErrorStatusCode(error, 400)).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to generate schedule' });
  }
});

export = router;

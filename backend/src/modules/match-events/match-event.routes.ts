import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import { MatchEventService, createEventSchema } from './match-event.service';

const router = Router();

router.get('/match/:id', async (request, response) => {
  try {
    const events = await MatchEventService.getByMatchId(request.params.id);
    response.json({ success: true, data: events });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load events' });
  }
});

router.post('/', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER, Role.REFEREE), async (request, response) => {
  try {
    const payload = createEventSchema.parse(request.body);
    const event = await MatchEventService.create(payload);

    response.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to create event' });
  }
});

router.delete('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER, Role.REFEREE), async (request, response) => {
  try {
    await MatchEventService.delete(request.params.id);
    response.json({ success: true, data: { id: request.params.id } });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to delete event' });
  }
});

export = router;

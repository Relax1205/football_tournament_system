import { TournamentStatus, Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import { TournamentService } from './tournament.service';

const router = Router();

router.get('/', async (request, response) => {
  try {
    const statusParam = request.query.status;
    const status = typeof statusParam === 'string' && Object.values(TournamentStatus).includes(statusParam as TournamentStatus)
      ? (statusParam as TournamentStatus)
      : undefined;

    const tournaments = await TournamentService.getAll(status);
    response.json({ success: true, data: tournaments });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load tournaments' });
  }
});

router.get('/:id', async (request, response) => {
  try {
    const tournament = await TournamentService.getById(request.params.id);

    if (!tournament) {
      return response.status(404).json({ success: false, error: 'Tournament not found' });
    }

    response.json({ success: true, data: tournament });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load tournament' });
  }
});

router.post('/', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const tournament = await TournamentService.create(request.body);
    response.status(201).json({ success: true, data: tournament });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to create tournament' });
  }
});

router.put('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const tournament = await TournamentService.update(request.params.id, request.body);
    response.json({ success: true, data: tournament });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to update tournament' });
  }
});

router.patch('/:id/status', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const schema = z.object({
      status: z.nativeEnum(TournamentStatus),
    });
    const payload = schema.parse(request.body);

    const tournament = await TournamentService.updateStatus(request.params.id, payload.status);
    response.json({ success: true, data: tournament });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to update tournament status' });
  }
});

router.delete('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    await TournamentService.delete(request.params.id);
    response.json({ success: true, data: { id: request.params.id } });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to delete tournament' });
  }
});

export = router;

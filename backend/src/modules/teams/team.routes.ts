import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import { TeamService, addPlayerSchema } from './team.service';

const router = Router();

router.get('/', async (request, response) => {
  try {
    const tournamentId = typeof request.query.tournamentId === 'string'
      ? request.query.tournamentId
      : undefined;
    const teams = await TeamService.getAll(tournamentId);

    response.json({ success: true, data: teams });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load teams' });
  }
});

router.get('/:id', async (request, response) => {
  try {
    const team = await TeamService.getById(request.params.id);

    if (!team) {
      return response.status(404).json({ success: false, error: 'Team not found' });
    }

    response.json({ success: true, data: team });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load team' });
  }
});

router.post('/', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const team = await TeamService.create(request.body);
    response.status(201).json({ success: true, data: team });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to create team' });
  }
});

router.put('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const team = await TeamService.update(request.params.id, request.body);
    response.json({ success: true, data: team });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to update team' });
  }
});

router.delete('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    await TeamService.delete(request.params.id);
    response.json({ success: true, data: { id: request.params.id } });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to delete team' });
  }
});

router.post('/:id/players', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER, Role.COACH), async (request, response) => {
  try {
    const payload = addPlayerSchema.parse(request.body);
    const player = await TeamService.addPlayer(request.params.id, payload);

    response.status(201).json({ success: true, data: player });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to add player' });
  }
});

export = router;

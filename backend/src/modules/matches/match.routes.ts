import { Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { getErrorStatusCode } from '../../common/http-error';
import { authenticate, requireRoles } from '../../middleware/auth';
import { MatchService } from './match.service';

const router = Router();

router.get('/', async (request, response) => {
  try {
    const tournamentId = typeof request.query.tournamentId === 'string'
      ? request.query.tournamentId
      : undefined;
    const coachId = typeof request.query.coachId === 'string'
      ? request.query.coachId
      : undefined;
    const matches = await MatchService.getAll(tournamentId, coachId);

    response.json({ success: true, data: matches });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load matches' });
  }
});

router.post('/', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const match = await MatchService.create(request.body);
    response.status(201).json({ success: true, data: match });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(getErrorStatusCode(error, 400)).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to create match' });
  }
});

router.put('/:id/score', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER, Role.REFEREE), async (request, response) => {
  try {
    const match = await MatchService.updateScore(request.params.id, request.body, request.auth);
    response.json({ success: true, data: match });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(getErrorStatusCode(error, 400)).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to save match result' });
  }
});

router.patch('/:id/confirm', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const match = await MatchService.confirmMatch(request.params.id, request.auth!.userId);
    response.json({ success: true, data: match });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(getErrorStatusCode(error, 400)).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to confirm match' });
  }
});

router.delete('/:id', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    await MatchService.delete(request.params.id);
    response.json({ success: true, data: { id: request.params.id } });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(getErrorStatusCode(error, 400)).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to delete match' });
  }
});

export = router;

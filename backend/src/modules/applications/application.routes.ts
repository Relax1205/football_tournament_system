import { ApplicationStatus, Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import {
  ApplicationService,
  createApplicationSchema,
  updateApplicationStatusSchema,
} from './application.service';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER, Role.COACH),
  async (request, response) => {
    try {
      const tournamentId = typeof request.query.tournamentId === 'string'
        ? request.query.tournamentId
        : undefined;
      const applicantId = request.auth?.role === Role.COACH ? request.auth.userId : undefined;

      const applications = await ApplicationService.getAll(tournamentId, applicantId);
      response.json({ success: true, data: applications });
    } catch {
      response.status(500).json({ success: false, error: 'Unable to load applications' });
    }
  },
);

router.post(
  '/',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER, Role.COACH),
  async (request, response) => {
    try {
      const payload = createApplicationSchema.parse(request.body);
      const application = await ApplicationService.create(request.auth!.userId, payload);

      response.status(201).json({ success: true, data: application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }

      if (error instanceof Error) {
        return response.status(400).json({ success: false, error: error.message });
      }

      response.status(500).json({ success: false, error: 'Unable to create application' });
    }
  },
);

router.patch(
  '/:id/status',
  authenticate,
  requireRoles(Role.ADMIN, Role.ORGANIZER),
  async (request, response) => {
    try {
      const payload = updateApplicationStatusSchema.parse(request.body);
      const application = await ApplicationService.updateStatus(request.params.id, payload.status);

      response.json({ success: true, data: application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }

      if (error instanceof Error) {
        return response.status(400).json({ success: false, error: error.message });
      }

      response.status(500).json({ success: false, error: 'Unable to update application' });
    }
  },
);

export = router;

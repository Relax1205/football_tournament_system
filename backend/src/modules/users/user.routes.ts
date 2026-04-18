import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../middleware/auth';
import { UserService } from './user.service';

const router = Router();

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

router.get('/', authenticate, requireRoles(Role.ADMIN, Role.ORGANIZER), async (request, response) => {
  try {
    const roleParam = request.query.role;
    const role = typeof roleParam === 'string' && Object.values(Role).includes(roleParam as Role)
      ? (roleParam as Role)
      : undefined;

    const users = await UserService.getAll(role);
    response.json({ success: true, data: users });
  } catch (error) {
    response.status(500).json({ success: false, error: 'Unable to load users' });
  }
});

router.patch('/:id/role', authenticate, requireRoles(Role.ADMIN), async (request, response) => {
  try {
    const payload = updateRoleSchema.parse(request.body);
    const user = await UserService.updateRole(request.params.id, payload.role);

    response.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }

    if (error instanceof Error) {
      return response.status(400).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to update role' });
  }
});

export = router;

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { NotificationService } from './notification.service';

const router = Router();

router.get('/', authenticate, async (request, response) => {
  try {
    const notifications = await NotificationService.getAllForUser(request.auth!.userId);
    response.json({ success: true, data: notifications });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load notifications' });
  }
});

router.patch('/read-all', authenticate, async (request, response) => {
  try {
    const result = await NotificationService.markAllRead(request.auth!.userId);
    response.json({ success: true, data: result });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to update notifications' });
  }
});

router.patch('/:id/read', authenticate, async (request, response) => {
  try {
    const notification = await NotificationService.markRead(request.auth!.userId, request.params.id);
    response.json({ success: true, data: notification });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(404).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to update notification' });
  }
});

router.delete('/:id', authenticate, async (request, response) => {
  try {
    await NotificationService.delete(request.auth!.userId, request.params.id);
    response.json({ success: true, data: { id: request.params.id } });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(404).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to delete notification' });
  }
});

export = router;

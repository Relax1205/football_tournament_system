// football_tournament_system/backend/src/modules/match-events/match-event.routes.ts
import { Router, Request, Response } from 'express';
import { MatchEventService } from './match-event.service';
import { z } from 'zod';

const router = Router();

// POST /api/match-events
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = await MatchEventService.create(req.body);
    res.status(201).json({ success: true,  event });
  } catch (error: any) {
    // БЕЗОПАСНОЕ ЛОГИРОВАНИЕ для Node.js v24
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/match-events]', errorMessage);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/match-events/match/:id
router.get('/match/:id', async (req: Request, res: Response) => {
  try {
    const events = await MatchEventService.getByMatchId(req.params.id);
    res.json({ success: true,  events });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/match-events/match/:id]', errorMessage);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/match-events/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await MatchEventService.delete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DELETE /api/match-events/:id]', errorMessage);
    res.status(500).json({ error: 'Server error' });
  }
});

export = router;
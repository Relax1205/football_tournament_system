// football_tournament_system/backend/src/modules/matches/match.routes.ts
import { Router, Request, Response } from 'express';
import { MatchService } from './match.service';
import { z } from 'zod';

const router = Router();

// POST /api/matches - Создать матч
router.post('/', async (req: Request, res: Response) => {
  try {
    const match = await MatchService.create(req.body);
    res.status(201).json({ success: true,  match });
  } catch (error) {
    console.error('[POST /api/matches]', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/matches - Список матчей
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const matches = await MatchService.getAll(tournamentId as string | undefined);
    res.json({ success: true,  matches });
  } catch (error) {
    console.error('[GET /api/matches]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/matches/:id/score - Обновить счёт (Судья)
router.put('/:id/score', async (req: Request, res: Response) => {
  try {
    const match = await MatchService.updateScore(req.params.id, req.body);
    res.json({ success: true,  match });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/matches/:id/confirm - Подтвердить матч (Организатор)
router.patch('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const match = await MatchService.confirmMatch(req.params.id);
    res.json({ success: true,  match });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/matches/:id - Удалить матч
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await MatchService.delete(req.params.id);
    res.json({ success: true, message: 'Match deleted' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export = router;
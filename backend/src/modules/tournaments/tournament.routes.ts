// football_tournament_system/backend/src/modules/tournaments/tournament.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { TournamentService } from './tournament.service';
import { TournamentStatus } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id || id.length < 1) {
    return res.status(400).json({ success: false, error: 'Некорректный ID турнира' });
  }
  next();
};

// GET /api/tournaments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const tournaments = await TournamentService.getAll(status as TournamentStatus | undefined);
    res.json({ success: true, data: tournaments });
  } catch (error) {
    console.error('[GET /api/tournaments]', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// GET /api/tournaments/:id
router.get('/:id', validateId, async (req: Request, res: Response) => {
  try {
    const tournament = await TournamentService.getById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, error: 'Турнир не найден' });
    res.json({ success: true, data: tournament });
  } catch (error) {
    console.error('[GET /api/tournaments/:id]', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// POST /api/tournaments
router.post('/', async (req: Request, res: Response) => {
  try {
    const tournament = await TournamentService.create(req.body);
    res.status(201).json({
      success: true,
      data: tournament, // ✅ ИСПРАВЛЕНО: было "data"
      message: 'Турнир успешно создан',
    });
  } catch (error) {
    console.error('[POST /api/tournaments]', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Ошибка валидации', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Не удалось создать турнир' });
  }
});

// PUT /api/tournaments/:id
router.put('/:id', validateId, async (req: Request, res: Response) => {
  try {
    const tournament = await TournamentService.update(req.params.id, req.body);
    res.json({ success: true, data: tournament, message: 'Турнир успешно обновлён' });
  } catch (error) {
    console.error('[PUT /api/tournaments/:id]', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Ошибка валидации', details: error.errors });
    }
    if (error instanceof Error && error.message === 'Турнир не найден') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Не удалось обновить турнир' });
  }
});

// DELETE /api/tournaments/:id
router.delete('/:id', validateId, async (req: Request, res: Response) => {
  try {
    await TournamentService.delete(req.params.id);
    res.json({ success: true, message: 'Турнир успешно удалён' });
  } catch (error) {
    console.error('[DELETE /api/tournaments/:id]', error);
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Не удалось удалить турнир' });
  }
});

// PATCH /api/tournaments/:id/status
router.patch('/:id/status', validateId, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!Object.values(TournamentStatus).includes(status)) {
      return res.status(400).json({ success: false, error: 'Некорректный статус', allowed: Object.values(TournamentStatus) });
    }
    const tournament = await TournamentService.updateStatus(req.params.id, status);
    res.json({ success: true, data: tournament, message: 'Статус турнира обновлён' });
  } catch (error) {
    console.error('[PATCH /api/tournaments/:id/status]', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

export = router;
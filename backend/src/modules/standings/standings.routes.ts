// football_tournament_system/backend/src/modules/standings/standings.routes.ts
import { Router, Request, Response } from 'express';
import { StandingsService } from './standings.service';
import { z } from 'zod';

const router = Router();

// POST /api/standings/calculate
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      tournamentId: z.string().min(1, 'ID турнира обязателен'),
    });
    const { tournamentId } = schema.parse(req.body);

    const result = await StandingsService.calculate(tournamentId);
    res.json({ success: true,  result });
  } catch (error: any) {
    // БЕЗОПАСНОЕ ЛОГИРОВАНИЕ для Node.js v24
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/standings/calculate]', errorMessage);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/standings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) {
      return res.status(400).json({ error: 'tournamentId is required' });
    }

    const standings = await StandingsService.getStandings(tournamentId as string);
    
    // ✅ ИСПРАВЛЕНО: возвращаем массив напрямую в поле data
    res.json({ success: true,  data: standings });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/standings]', errorMessage);
    res.status(500).json({ error: 'Server error' });
  }
});

export = router;
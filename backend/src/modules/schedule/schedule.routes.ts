// football_tournament_system/backend/src/modules/schedule/schedule.routes.ts
import { Router, Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { z } from 'zod';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      tournamentId: z.string().min(1, 'ID турнира обязателен'),
      startDate: z.string().datetime(),
      daysBetweenRounds: z.number().int().min(1).default(7),
    });

    const validated = schema.parse(req.body);

    const matches = await ScheduleService.generateRoundRobin(
      validated.tournamentId,
      validated.startDate,
      validated.daysBetweenRounds
    );

    // ИСПРАВЛЕНО: используем ключ "data" для совместимости с тестом
    res.status(201).json({
      success: true,
       data: matches,
      message: `Расписание сгенерировано: ${matches.length} матчей`,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/schedule/generate]', errorMessage);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export = router;
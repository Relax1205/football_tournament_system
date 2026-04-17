// football_tournament_system/backend/src/modules/teams/team.routes.ts
import { Router, Request, Response } from 'express';
import { TeamService } from './team.service';
import { z } from 'zod';

const router = Router();

// POST /api/teams
router.post('/', async (req: Request, res: Response) => {
  try {
    const team = await TeamService.create(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    // Безопасное логирование ошибки
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/teams]', errorMessage);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teams
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const teams = await TeamService.getAll(tournamentId as string | undefined);
    res.json({ success: true, data: teams });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/teams]', errorMessage);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await TeamService.getById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/teams/:id]', errorMessage);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/teams/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const team = await TeamService.update(req.params.id, req.body);
    res.json({ success: true, data: team });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[PUT /api/teams/:id]', errorMessage);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await TeamService.delete(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DELETE /api/teams/:id]', errorMessage);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teams/:id/players
router.post('/:id/players', async (req: Request, res: Response) => {
  try {
    const playerSchema = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      number: z.number().optional(),
    });
    const validated = playerSchema.parse(req.body);
    
    const player = await TeamService.addPlayer(req.params.id, validated);
    res.status(201).json({ success: true, data: player });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/teams/:id/players]', errorMessage);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export = router;
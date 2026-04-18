import { Router } from 'express';
import { PlayerService } from './player.service';

const router = Router();

router.get('/', async (request, response) => {
  try {
    const tournamentId = typeof request.query.tournamentId === 'string'
      ? request.query.tournamentId
      : undefined;
    const teamId = typeof request.query.teamId === 'string'
      ? request.query.teamId
      : undefined;

    const players = await PlayerService.getAll(tournamentId, teamId);
    response.json({ success: true, data: players });
  } catch {
    response.status(500).json({ success: false, error: 'Unable to load players' });
  }
});

export = router;

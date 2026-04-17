// football_tournament_system/backend/src/modules/reports/report.routes.ts
import { Router, Request, Response } from 'express';
import { ReportService } from './report.service';

const router = Router();

// GET /api/reports/matches/:id/pdf
router.get('/matches/:id/pdf', async (req: Request, res: Response) => {
  try {
    const pdfBuffer = await ReportService.generateMatchProtocol(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="match-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[GET /api/reports/matches/:id/pdf]', error);
    if (error instanceof Error && error.message === 'Матч не найден') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Ошибка генерации PDF' });
  }
});

// GET /api/reports/standings/:tournamentId/excel
router.get('/standings/:tournamentId/excel', async (req: Request, res: Response) => {
  try {
    const excelBuffer = await ReportService.generateStandingsExcel(req.params.tournamentId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="standings-${req.params.tournamentId}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('[GET /api/reports/standings/:tournamentId/excel]', error);
    if (error instanceof Error && error.message === 'Нет данных для экспорта') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Ошибка генерации Excel' });
  }
});

export = router;
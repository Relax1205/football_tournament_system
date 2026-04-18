import { Request, Response, Router } from 'express';
import { ReportService } from './report.service';

const router = Router();

router.get('/matches/:id/pdf', async (request: Request, response: Response) => {
  try {
    const pdfBuffer = await ReportService.generateMatchProtocol(request.params.id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="match-${request.params.id}.pdf"`);
    response.send(pdfBuffer);
  } catch (error) {
    if (error instanceof Error && error.message === 'Match not found') {
      return response.status(404).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to generate PDF report' });
  }
});

router.get('/standings/:tournamentId/excel', async (request: Request, response: Response) => {
  try {
    const excelBuffer = await ReportService.generateStandingsExcel(request.params.tournamentId);
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="standings-${request.params.tournamentId}.xlsx"`,
    );
    response.send(excelBuffer);
  } catch (error) {
    if (error instanceof Error && error.message === 'No standings data available') {
      return response.status(404).json({ success: false, error: error.message });
    }

    response.status(500).json({ success: false, error: 'Unable to generate Excel report' });
  }
});

export = router;

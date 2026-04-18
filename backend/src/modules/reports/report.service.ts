// football_tournament_system/backend/src/modules/reports/report.service.ts
import { prisma } from '../../common/prisma';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

/**
 * Сервис генерации отчётности (PDF, Excel).
 * Использует библиотеки pdfkit и exceljs для формирования файлов на сервере.
 */
export class ReportService {
    /**
   * Генерация официального протокола матча в формате PDF.
   * Включает: шапку турнира, составы, счёт, события (голы/карточки).
   * 
   * @param matchId - ID матча.
   * @returns Buffer с содержимым PDF файла.
   * @throws {Error} Если матч не найден.
   */
    static async generateMatchProtocol(matchId: string): Promise<Buffer> {
        const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            tournament: true,
            homeTeam: true,
            awayTeam: true,
            referee: true,
            events: {
            include: { player: true },
            orderBy: { minute: 'asc' },
            },
        },
    });

    if (!match) throw new Error('Матч не найден');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Шапка
      doc.fontSize(20).text('ПРОТОКОЛ МАТЧА', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(12).text(`Турнир: ${match.tournament.name}`, { align: 'center' });
      doc.text(`Дата: ${match.date.toLocaleDateString('ru-RU')}`, { align: 'center' });
      doc.moveDown(1);

      // Команды и счёт
      doc.fontSize(14).text(`${match.homeTeam.name}  vs  ${match.awayTeam.name}`, { align: 'center' });
      doc.fontSize(16).text(`${match.homeScore} : ${match.awayScore}`, { align: 'center' });
      doc.moveDown(2);

      // Судья
      if (match.referee) {
        doc.fontSize(12).text(`Судья: ${match.referee.name || match.referee.email}`);
      }

      doc.moveDown(1);
      doc.fontSize(12).text('События матча:');
      doc.moveDown(0.5);

      // События
      match.events.forEach((event) => {
        const player = `${event.player.lastName} ${event.player.firstName}`;
        const typeText =
          event.type === 'GOAL' ? 'Гол' :
          event.type === 'YELLOW_CARD' ? 'ЖК' :
          event.type === 'RED_CARD' ? 'КК' : 'Замена';
        
        doc.fontSize(10).text(`${event.minute}' - ${typeText}: ${player} ${event.comment ? `(${event.comment})` : ''}`);
      });

      doc.moveDown(2);
      doc.fontSize(10).text('_______________________ / Подпись судьи', { align: 'right' });

      doc.end();
    });
  }

  /**
   * Экспорт турнирной таблицы в формат Excel (.xlsx).
   * 
   * @param tournamentId - ID турнира.
   * @returns Buffer с содержимым Excel файла.
   */
    static async generateStandingsExcel(tournamentId: string): Promise<Buffer> {
        const standings = await prisma.tournamentStanding.findMany({
        where: { tournamentId },
        include: { team: true },
        orderBy: [
          { points: 'desc' },
          { goalDifference: 'desc' },
          { goalsFor: 'desc' },
        ],
    });

    if (standings.length === 0) throw new Error('Нет данных для экспорта');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Турнирная таблица');

    worksheet.columns = [
      { header: 'Место', key: 'position', width: 10 },
      { header: 'Команда', key: 'team', width: 25 },
      { header: 'Игры', key: 'games', width: 10 },
      { header: 'В', key: 'wins', width: 10 },
      { header: 'Н', key: 'draws', width: 10 },
      { header: 'П', key: 'losses', width: 10 },
      { header: 'Голы', key: 'goals', width: 10 },
      { header: 'Очки', key: 'points', width: 10 },
    ];

    standings.forEach((s, index) => {
      worksheet.addRow({
        position: index + 1,
        team: s.team.name,
        games: s.gamesPlayed,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goals: `${s.goalsFor}-${s.goalsAgainst}`,
        points: s.points,
      });
    });

    // Стилизация заголовка
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
  }
}

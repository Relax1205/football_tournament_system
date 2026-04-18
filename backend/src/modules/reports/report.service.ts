import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../../common/prisma';

export class ReportService {
  static async generateMatchProtocol(matchId: string): Promise<Buffer> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        homeTeam: {
          include: {
            players: {
              orderBy: [
                { number: 'asc' },
                { lastName: 'asc' },
                { firstName: 'asc' },
              ],
            },
          },
        },
        awayTeam: {
          include: {
            players: {
              orderBy: [
                { number: 'asc' },
                { lastName: 'asc' },
                { firstName: 'asc' },
              ],
            },
          },
        },
        referee: true,
        events: {
          include: {
            player: true,
          },
          orderBy: { minute: 'asc' },
        },
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      const homeCaptain = match.homeTeam.players[0];
      const awayCaptain = match.awayTeam.players[0];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('MATCH PROTOCOL', { align: 'center' });
      doc.moveDown(1.5);
      doc.fontSize(12).text(`Tournament: ${match.tournament.name}`);
      doc.text(`Date: ${match.date.toLocaleDateString('ru-RU')}`);
      doc.text(`Venue: ${match.venue ?? 'n/a'}`);
      doc.text(`Referee: ${match.referee?.name ?? match.referee?.email ?? 'n/a'}`);
      doc.moveDown(1);

      doc.fontSize(14).text(`${match.homeTeam.name} vs ${match.awayTeam.name}`, { align: 'center' });
      doc.fontSize(16).text(`Score: ${match.homeScore}:${match.awayScore}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(12).text('Match events:');
      if (match.events.length === 0) {
        doc.fontSize(10).text('No registered events.');
      } else {
        match.events.forEach((event) => {
          const player = `${event.player.lastName} ${event.player.firstName}`;
          const typeText =
            event.type === 'GOAL'
              ? 'Goal'
              : event.type === 'YELLOW_CARD'
                ? 'Yellow card'
                : event.type === 'RED_CARD'
                  ? 'Red card'
                  : 'Substitution';

          doc.fontSize(10).text(
            `${event.minute}' - ${typeText}: ${player}${event.comment ? ` (${event.comment})` : ''}`,
          );
        });
      }

      doc.moveDown(1.5);
      doc.fontSize(12).text('Home squad:');
      if (match.homeTeam.players.length === 0) {
        doc.fontSize(10).text('No registered players.');
      } else {
        match.homeTeam.players.forEach((player) => {
          doc.fontSize(10).text(`${player.number ?? '-'}  ${player.lastName} ${player.firstName}`);
        });
      }

      doc.moveDown(1);
      doc.fontSize(12).text('Away squad:');
      if (match.awayTeam.players.length === 0) {
        doc.fontSize(10).text('No registered players.');
      } else {
        match.awayTeam.players.forEach((player) => {
          doc.fontSize(10).text(`${player.number ?? '-'}  ${player.lastName} ${player.firstName}`);
        });
      }

      doc.moveDown(2);
      doc.fontSize(10).text('Referee signature: _______________________');
      doc.text(`Home captain: ${homeCaptain ? `${homeCaptain.lastName} ${homeCaptain.firstName}` : 'n/a'}`);
      doc.text('Home captain signature: _______________________');
      doc.text(`Away captain: ${awayCaptain ? `${awayCaptain.lastName} ${awayCaptain.firstName}` : 'n/a'}`);
      doc.text('Away captain signature: _______________________');

      doc.end();
    });
  }

  static async generateStandingsExcel(tournamentId: string): Promise<Buffer> {
    const standings = await prisma.tournamentStanding.findMany({
      where: { tournamentId },
      include: {
        team: true,
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' },
      ],
    });

    if (standings.length === 0) {
      throw new Error('No standings data available');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Standings');

    worksheet.columns = [
      { header: 'Place', key: 'position', width: 10 },
      { header: 'Team', key: 'team', width: 25 },
      { header: 'Games', key: 'games', width: 10 },
      { header: 'W', key: 'wins', width: 10 },
      { header: 'D', key: 'draws', width: 10 },
      { header: 'L', key: 'losses', width: 10 },
      { header: 'Goals', key: 'goals', width: 12 },
      { header: 'Points', key: 'points', width: 10 },
    ];

    standings.forEach((standing, index) => {
      worksheet.addRow({
        position: index + 1,
        team: standing.team.name,
        games: standing.gamesPlayed,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        goals: `${standing.goalsFor}-${standing.goalsAgainst}`,
        points: standing.points,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
  }
}

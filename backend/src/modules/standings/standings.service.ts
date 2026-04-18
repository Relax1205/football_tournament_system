import { MatchStatus } from '@prisma/client';
import { prisma } from '../../common/prisma';

type TeamStat = {
  teamId: string;
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export class StandingsService {
  static async calculate(tournamentId: string) {
    const teams = await prisma.team.findMany({
      where: { tournamentId },
      select: {
        id: true,
      },
    });

    if (teams.length === 0) {
      return [];
    }

    const matches = await prisma.match.findMany({
      where: {
        tournamentId,
        status: MatchStatus.CONFIRMED,
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const stats = new Map<string, TeamStat>(
      teams.map((team) => [team.id, {
        teamId: team.id,
        points: 0,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      }]),
    );

    for (const match of matches) {
      const home = stats.get(match.homeTeamId);
      const away = stats.get(match.awayTeamId);

      if (!home || !away) {
        continue;
      }

      home.gamesPlayed += 1;
      away.gamesPlayed += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.points += 3;
        home.wins += 1;
        away.losses += 1;
      } else if (match.homeScore < match.awayScore) {
        away.points += 3;
        away.wins += 1;
        home.losses += 1;
      } else {
        home.points += 1;
        away.points += 1;
        home.draws += 1;
        away.draws += 1;
      }
    }

    const sortedStats = [...stats.values()].map((stat) => ({
      ...stat,
      goalDifference: stat.goalsFor - stat.goalsAgainst,
    })).sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      if (right.goalDifference !== left.goalDifference) {
        return right.goalDifference - left.goalDifference;
      }

      return right.goalsFor - left.goalsFor;
    });

    await prisma.$transaction(async (transaction) => {
      await transaction.tournamentStanding.deleteMany({
        where: { tournamentId },
      });

      if (sortedStats.length > 0) {
        await transaction.tournamentStanding.createMany({
          data: sortedStats.map((stat) => ({
            tournamentId,
            teamId: stat.teamId,
            points: stat.points,
            gamesPlayed: stat.gamesPlayed,
            wins: stat.wins,
            draws: stat.draws,
            losses: stat.losses,
            goalsFor: stat.goalsFor,
            goalsAgainst: stat.goalsAgainst,
            goalDifference: stat.goalDifference,
          })),
        });
      }
    });

    return this.getStandings(tournamentId);
  }

  static async getStandings(tournamentId: string) {
    return prisma.tournamentStanding.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' },
      ],
    });
  }
}

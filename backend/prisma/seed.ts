import bcrypt from 'bcryptjs';
import {
  ApplicationStatus,
  EventType,
  MatchStatus,
  PrismaClient,
  Role,
  TournamentFormat,
  TournamentStatus,
} from '@prisma/client';
import { StandingsService } from '../src/modules/standings/standings.service';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Test123!';
const DEMO_EMAILS = [
  'admin@tournament.ru',
  'organizer@tournament.ru',
  'org@tournament.ru',
  'referee@tournament.ru',
  'coach@tournament.ru',
  'coach2@team.ru',
  'fan@tournament.ru',
];

type SeedPlayerInput = {
  firstName: string;
  lastName: string;
  number: number;
};

// Full 18-player roster so every seeded team looks like a realistic tournament squad.
const SQUAD_TEMPLATE: SeedPlayerInput[] = [
  { firstName: 'Anton', lastName: 'Belov', number: 1 },
  { firstName: 'Ivan', lastName: 'Sokolov', number: 2 },
  { firstName: 'Pavel', lastName: 'Romanov', number: 3 },
  { firstName: 'Mikhail', lastName: 'Orlov', number: 4 },
  { firstName: 'Dmitry', lastName: 'Egorov', number: 5 },
  { firstName: 'Kirill', lastName: 'Zaitsev', number: 6 },
  { firstName: 'Andrey', lastName: 'Smirnov', number: 7 },
  { firstName: 'Maksim', lastName: 'Kuznetsov', number: 8 },
  { firstName: 'Ilya', lastName: 'Lebedev', number: 9 },
  { firstName: 'Sergey', lastName: 'Popov', number: 10 },
  { firstName: 'Roman', lastName: 'Fedorov', number: 11 },
  { firstName: 'Egor', lastName: 'Kozlov', number: 12 },
  { firstName: 'Nikita', lastName: 'Tarasov', number: 13 },
  { firstName: 'Alexey', lastName: 'Morozov', number: 14 },
  { firstName: 'Vladislav', lastName: 'Vinogradov', number: 15 },
  { firstName: 'Denis', lastName: 'Mironov', number: 16 },
  { firstName: 'Timur', lastName: 'Borisov', number: 17 },
  { firstName: 'Georgy', lastName: 'Karpov', number: 18 },
];

const FULL_SQUAD_SIZE = SQUAD_TEMPLATE.length;

function buildRoster(tag: string): SeedPlayerInput[] {
  return SQUAD_TEMPLATE.map((player) => ({
    ...player,
    lastName: `${player.lastName}-${tag}`,
  }));
}

async function createUser(email: string, name: string, role: Role, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      role,
      password: hashedPassword,
    },
  });
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.tournamentStanding.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.application.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        in: DEMO_EMAILS,
      },
    },
  });

  const admin = await createUser('admin@tournament.ru', 'Ivan Administrator', Role.ADMIN, DEMO_PASSWORD);
  const organizer = await createUser('org@tournament.ru', 'Maria Organizer', Role.ORGANIZER, DEMO_PASSWORD);
  const referee = await createUser('referee@tournament.ru', 'Sergey Referee', Role.REFEREE, DEMO_PASSWORD);
  const coach1 = await createUser('coach@tournament.ru', 'Alexey Coach', Role.COACH, DEMO_PASSWORD);
  const coach2 = await createUser('coach2@team.ru', 'Dmitry Coach', Role.COACH, DEMO_PASSWORD);
  const fan = await createUser('fan@tournament.ru', 'Maxim Fan', Role.VIEWER, DEMO_PASSWORD);

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Админ-панель готова',
        message: 'Назначайте роли новым пользователям и отслеживайте состояние демонстрационного стенда.',
        kind: 'info',
      },
      {
        userId: organizer.id,
        title: 'Данные для проверки загружены',
        message: 'В системе уже есть турниры, заявки, матчи и таблица для быстрой проверки сценариев.',
        kind: 'info',
      },
      {
        userId: referee.id,
        title: 'Матчи назначены',
        message: 'Откройте раздел матчей и внесите результаты для демонстрации рабочего процесса.',
        kind: 'info',
      },
      {
        userId: coach1.id,
        title: 'Команда готова к проверке',
        message: 'Вы можете подать новую заявку, добавить игроков или просмотреть составы команды.',
        kind: 'info',
      },
      {
        userId: coach2.id,
        title: 'Заявки ожидают решения',
        message: 'Часть заявок уже создана в seed-данных, чтобы можно было проверить сценарии одобрения и отклонения.',
        kind: 'info',
      },
      {
        userId: fan.id,
        title: 'Добро пожаловать',
        message: 'Роль зрителя открывает доступ к просмотру турниров, матчей и турнирной таблицы.',
        kind: 'info',
      },
    ],
  });

  const activeTournament = await prisma.tournament.create({
    data: {
      name: 'RTU Cup 2026',
      description: 'Main demo tournament with schedule, standings and reports.',
      startDate: new Date('2026-04-01T15:00:00.000Z'),
      endDate: new Date('2026-05-31T15:00:00.000Z'),
      groups: 1,
      format: TournamentFormat.LEAGUE,
      status: TournamentStatus.IN_PROGRESS,
    },
  });

  const registrationTournament = await prisma.tournament.create({
    data: {
      name: 'Spring Cup Ekaterinburg',
      description: 'Tournament open for team applications.',
      startDate: new Date('2026-05-10T12:00:00.000Z'),
      endDate: new Date('2026-06-15T12:00:00.000Z'),
      groups: 2,
      format: TournamentFormat.GROUPS,
      status: TournamentStatus.REGISTRATION_OPEN,
    },
  });

  const programmers = await prisma.team.create({
    data: {
      name: 'FC Programmers',
      city: 'Moscow',
      tournamentId: activeTournament.id,
      coachId: coach1.id,
      players: {
        create: buildRoster('Code'),
      },
    },
  });

  const testers = await prisma.team.create({
    data: {
      name: 'SC Testers',
      city: 'Kazan',
      tournamentId: activeTournament.id,
      coachId: coach2.id,
      players: {
        create: buildRoster('Test'),
      },
    },
  });

  const analysts = await prisma.team.create({
    data: {
      name: 'Analysts United',
      city: 'Novosibirsk',
      tournamentId: activeTournament.id,
      players: {
        create: buildRoster('Analyst'),
      },
    },
  });

  const ops = await prisma.team.create({
    data: {
      name: 'DevOps City',
      city: 'Saint Petersburg',
      tournamentId: activeTournament.id,
      players: {
        create: buildRoster('Ops'),
      },
    },
  });

  const approvedApplication = await prisma.application.create({
    data: {
      tournamentId: registrationTournament.id,
      applicantId: coach1.id,
      teamName: 'Uralets',
      city: 'Ekaterinburg',
      coachName: coach1.name ?? 'Alexey Coach',
      playersCount: FULL_SQUAD_SIZE,
      status: ApplicationStatus.APPROVED,
    },
  });

  const approvedTeam = await prisma.team.create({
    data: {
      name: approvedApplication.teamName,
      city: approvedApplication.city ?? undefined,
      tournamentId: registrationTournament.id,
      coachId: coach1.id,
      players: {
        create: buildRoster('Ural'),
      },
    },
  });

  await prisma.application.update({
    where: { id: approvedApplication.id },
    data: { approvedTeamId: approvedTeam.id },
  });

  await prisma.application.create({
    data: {
      tournamentId: registrationTournament.id,
      applicantId: coach2.id,
      teamName: 'Fakel-M',
      city: 'Ekaterinburg',
      coachName: coach2.name ?? 'Dmitry Coach',
      playersCount: 20,
      status: ApplicationStatus.PENDING,
    },
  });

  await prisma.application.create({
    data: {
      tournamentId: registrationTournament.id,
      applicantId: coach2.id,
      teamName: 'Meteor-96',
      city: 'Perm',
      coachName: coach2.name ?? 'Dmitry Coach',
      playersCount: 22,
      status: ApplicationStatus.REJECTED,
    },
  });

  const programmerPlayers = await prisma.player.findMany({ where: { teamId: programmers.id } });
  const testerPlayers = await prisma.player.findMany({ where: { teamId: testers.id } });
  const analystPlayers = await prisma.player.findMany({ where: { teamId: analysts.id } });
  const opsPlayers = await prisma.player.findMany({ where: { teamId: ops.id } });

  const match1 = await prisma.match.create({
    data: {
      tournamentId: activeTournament.id,
      homeTeamId: programmers.id,
      awayTeamId: testers.id,
      refereeId: referee.id,
      venue: 'Yunost Stadium',
      date: new Date('2026-04-05T15:00:00.000Z'),
      status: MatchStatus.CONFIRMED,
      homeScore: 2,
      awayScore: 1,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      tournamentId: activeTournament.id,
      homeTeamId: analysts.id,
      awayTeamId: ops.id,
      refereeId: referee.id,
      venue: 'Vostok Arena',
      date: new Date('2026-04-06T15:00:00.000Z'),
      status: MatchStatus.CONFIRMED,
      homeScore: 0,
      awayScore: 0,
    },
  });

  await prisma.match.create({
    data: {
      tournamentId: activeTournament.id,
      homeTeamId: programmers.id,
      awayTeamId: analysts.id,
      refereeId: referee.id,
      venue: 'Dinamo Stadium',
      date: new Date('2026-04-12T15:00:00.000Z'),
      status: MatchStatus.AWAITING_CONFIRMATION,
      homeScore: 3,
      awayScore: 2,
    },
  });

  await prisma.match.create({
    data: {
      tournamentId: activeTournament.id,
      homeTeamId: testers.id,
      awayTeamId: ops.id,
      refereeId: referee.id,
      venue: 'Meteor Arena',
      date: new Date('2026-04-19T15:00:00.000Z'),
      status: MatchStatus.SCHEDULED,
      homeScore: 0,
      awayScore: 0,
    },
  });

  await prisma.match.create({
    data: {
      tournamentId: activeTournament.id,
      homeTeamId: analysts.id,
      awayTeamId: programmers.id,
      refereeId: referee.id,
      venue: 'Central Stadium',
      date: new Date('2026-04-26T15:00:00.000Z'),
      status: MatchStatus.CANCELLED,
      homeScore: 0,
      awayScore: 0,
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: match1.id,
        playerId: programmerPlayers[0].id,
        type: EventType.GOAL,
        minute: 23,
        comment: 'Long-range strike',
      },
      {
        matchId: match1.id,
        playerId: testerPlayers[0].id,
        type: EventType.GOAL,
        minute: 45,
        comment: 'Penalty goal',
      },
      {
        matchId: match1.id,
        playerId: programmerPlayers[1].id,
        type: EventType.GOAL,
        minute: 78,
        comment: 'Winning goal after a cross',
      },
      {
        matchId: match1.id,
        playerId: testerPlayers[1].id,
        type: EventType.YELLOW_CARD,
        minute: 64,
        comment: 'Tactical foul',
      },
      {
        matchId: match2.id,
        playerId: analystPlayers[0].id,
        type: EventType.YELLOW_CARD,
        minute: 34,
        comment: 'Tactical foul',
      },
      {
        matchId: match2.id,
        playerId: opsPlayers[1].id,
        type: EventType.RED_CARD,
        minute: 88,
        comment: 'Second yellow card',
      },
    ],
  });

  await StandingsService.calculate(activeTournament.id);

  console.log('Seed completed successfully');
  console.log('Demo accounts:');
  console.log(`admin@tournament.ru / ${DEMO_PASSWORD}`);
  console.log(`org@tournament.ru / ${DEMO_PASSWORD}`);
  console.log(`referee@tournament.ru / ${DEMO_PASSWORD}`);
  console.log(`coach@tournament.ru / ${DEMO_PASSWORD}`);
  console.log(`coach2@team.ru / ${DEMO_PASSWORD}`);
  console.log(`fan@tournament.ru / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

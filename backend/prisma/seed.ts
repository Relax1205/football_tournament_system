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
  await prisma.matchEvent.deleteMany();
  await prisma.tournamentStanding.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.application.deleteMany();
  await prisma.tournament.deleteMany();

  await createUser('admin@tournament.ru', 'Иван Администратор', Role.ADMIN, 'TestPass123!');
  const organizer = await createUser('organizer@tournament.ru', 'Мария Организатор', Role.ORGANIZER, 'TestPass123!');
  const referee = await createUser('referee@tournament.ru', 'Сергей Судья', Role.REFEREE, 'TestPass123!');
  const coach1 = await createUser('coach@tournament.ru', 'Алексей Тренер', Role.COACH, 'TestPass123!');
  const coach2 = await createUser('coach2@team.ru', 'Дмитрий Тренер', Role.COACH, 'TestPass123!');
  await createUser('fan@tournament.ru', 'Максим Болельщик', Role.VIEWER, 'TestPass123!');

  const activeTournament = await prisma.tournament.create({
    data: {
      name: 'Кубок РТУ МИРЭА 2026',
      description: 'Основной учебный турнир для демонстрации расписания, результатов и таблицы.',
      startDate: new Date('2026-04-01T15:00:00.000Z'),
      endDate: new Date('2026-05-31T15:00:00.000Z'),
      groups: 1,
      format: TournamentFormat.LEAGUE,
      status: TournamentStatus.IN_PROGRESS,
    },
  });

  const registrationTournament = await prisma.tournament.create({
    data: {
      name: 'Весенний кубок Екатеринбурга',
      description: 'Турнир с открытой регистрацией и заявками команд.',
      startDate: new Date('2026-05-10T12:00:00.000Z'),
      endDate: new Date('2026-06-15T12:00:00.000Z'),
      groups: 2,
      format: TournamentFormat.GROUPS,
      status: TournamentStatus.REGISTRATION_OPEN,
    },
  });

  const programmers = await prisma.team.create({
    data: {
      name: 'ФК Программисты',
      city: 'Москва',
      tournamentId: activeTournament.id,
      coachId: coach1.id,
      players: {
        create: [
          { firstName: 'Иван', lastName: 'Кодов', number: 10 },
          { firstName: 'Петр', lastName: 'Багов', number: 7 },
          { firstName: 'Анна', lastName: 'Логова', number: 1 },
        ],
      },
    },
  });

  const testers = await prisma.team.create({
    data: {
      name: 'СК Тестировщики',
      city: 'Москва',
      tournamentId: activeTournament.id,
      coachId: coach2.id,
      players: {
        create: [
          { firstName: 'Сергей', lastName: 'Чеклистов', number: 9 },
          { firstName: 'Олег', lastName: 'Фреймов', number: 5 },
          { firstName: 'Мария', lastName: 'Регрессова', number: 11 },
        ],
      },
    },
  });

  const analysts = await prisma.team.create({
    data: {
      name: 'Аналитики United',
      city: 'Москва',
      tournamentId: activeTournament.id,
      players: {
        create: [
          { firstName: 'Артем', lastName: 'Диаграммов', number: 8 },
          { firstName: 'Лев', lastName: 'Требов', number: 6 },
          { firstName: 'Егор', lastName: 'Процессов', number: 4 },
        ],
      },
    },
  });

  const ops = await prisma.team.create({
    data: {
      name: 'DevOps City',
      city: 'Санкт-Петербург',
      tournamentId: activeTournament.id,
      players: {
        create: [
          { firstName: 'Юрий', lastName: 'Деплоев', number: 3 },
          { firstName: 'Илья', lastName: 'Контейнеров', number: 14 },
          { firstName: 'Соня', lastName: 'Мониторинг', number: 19 },
        ],
      },
    },
  });

  const approvedApplication = await prisma.application.create({
    data: {
      tournamentId: registrationTournament.id,
      applicantId: coach1.id,
      teamName: 'Уралец',
      city: 'Екатеринбург',
      coachName: coach1.name ?? 'Алексей Тренер',
      playersCount: 18,
      status: ApplicationStatus.APPROVED,
    },
  });

  const approvedTeam = await prisma.team.create({
    data: {
      name: approvedApplication.teamName,
      city: approvedApplication.city ?? undefined,
      tournamentId: registrationTournament.id,
      coachId: coach1.id,
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
      teamName: 'Факел-М',
      city: 'Екатеринбург',
      coachName: coach2.name ?? 'Дмитрий Тренер',
      playersCount: 16,
      status: ApplicationStatus.PENDING,
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
      venue: 'Стадион Юность',
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
      venue: 'Манеж Восток',
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
      venue: 'Стадион Динамо',
      date: new Date('2026-04-12T15:00:00.000Z'),
      status: MatchStatus.AWAITING_CONFIRMATION,
      homeScore: 3,
      awayScore: 2,
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      {
        matchId: match1.id,
        playerId: programmerPlayers[0].id,
        type: EventType.GOAL,
        minute: 23,
        comment: 'Удар из-за пределов штрафной',
      },
      {
        matchId: match1.id,
        playerId: testerPlayers[0].id,
        type: EventType.GOAL,
        minute: 45,
        comment: 'Гол с пенальти',
      },
      {
        matchId: match1.id,
        playerId: programmerPlayers[1].id,
        type: EventType.GOAL,
        minute: 78,
        comment: 'Решающий мяч после навеса',
      },
      {
        matchId: match1.id,
        playerId: testerPlayers[1].id,
        type: EventType.YELLOW_CARD,
        minute: 64,
        comment: 'Срыв атаки',
      },
      {
        matchId: match2.id,
        playerId: analystPlayers[0].id,
        type: EventType.YELLOW_CARD,
        minute: 34,
        comment: 'Тактический фол',
      },
      {
        matchId: match2.id,
        playerId: opsPlayers[1].id,
        type: EventType.RED_CARD,
        minute: 88,
        comment: 'Вторая жёлтая карточка',
      },
    ],
  });

  await StandingsService.calculate(activeTournament.id);

  console.log('Seed completed successfully');
  console.log('Demo accounts:');
  console.log('admin@tournament.ru / TestPass123!');
  console.log('organizer@tournament.ru / TestPass123!');
  console.log('referee@tournament.ru / TestPass123!');
  console.log('coach@tournament.ru / TestPass123!');
  console.log('coach2@team.ru / TestPass123!');
  console.log('fan@tournament.ru / TestPass123!');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

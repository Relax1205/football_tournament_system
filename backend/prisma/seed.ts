// football_tournament_system/backend/prisma/seed.ts
import { PrismaClient, Role, TournamentStatus, TournamentFormat, MatchStatus, EventType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем наполнение базы данных...');

  // 1. Пользователи
  const hashedPassword = await bcrypt.hash('TestPass123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@system.ru' },
    update: {},
    create: {
      email: 'admin@system.ru',
      name: 'Иван Администратор',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'org@tournament.ru' },
    update: {},
    create: {
      email: 'org@tournament.ru',
      name: 'Мария Организатор',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  const referee = await prisma.user.upsert({
    where: { email: 'referee@match.ru' },
    update: {},
    create: {
      email: 'referee@match.ru',
      name: 'Сергей Судья',
      password: hashedPassword,
      role: Role.REFEREE,
    },
  });

  const coach1 = await prisma.user.upsert({
    where: { email: 'coach1@team.ru' },
    update: {},
    create: {
      email: 'coach1@team.ru',
      name: 'Алексей Тренер',
      password: hashedPassword,
      role: Role.COACH,
    },
  });

  const coach2 = await prisma.user.upsert({
    where: { email: 'coach2@team.ru' },
    update: {},
    create: {
      email: 'coach2@team.ru',
      name: 'Дмитрий Тренер',
      password: hashedPassword,
      role: Role.COACH,
    },
  });

  console.log('✅ Пользователи созданы');

  // 2. Турнир
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Кубок РТУ МИРЭА 2026',
      description: 'Ежегодный любительский турнир среди студентов и сотрудников.',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-01'),
      format: TournamentFormat.LEAGUE,
      status: TournamentStatus.IN_PROGRESS,
    },
  });

  console.log(`✅ Турнир создан: ${tournament.name}`);

  // 3. Команды и игроки
  const team1 = await prisma.team.create({
    data: {
      name: 'ФК "Программисты"',
      city: 'Москва',
      tournamentId: tournament.id,
      coachId: coach1.id,
      players: {
        create: [
          { firstName: 'Иван', lastName: 'Кодов', number: 10 },
          { firstName: 'Петр', lastName: 'Багов', number: 7 },
          { firstName: 'Анна', lastName: 'Логов', number: 1 },
        ],
      },
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'СК "Тестировщики"',
      city: 'Москва',
      tournamentId: tournament.id,
      coachId: coach2.id,
      players: {
        create: [
          { firstName: 'Сергей', lastName: 'Багов', number: 9 },
          { firstName: 'Олег', lastName: 'Фреймов', number: 5 },
          { firstName: 'Мария', lastName: 'Тестова', number: 11 },
        ],
      },
    },
  });

  console.log(`✅ Команды созданы: ${team1.name}, ${team2.name}`);

  // 4. Матч
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      date: new Date('2026-04-05T14:00:00Z'),
      status: MatchStatus.SCHEDULED,
      refereeId: referee.id,
      homeScore: 2,
      awayScore: 1,
    },
  });

  console.log(`✅ Матч создан: ${team1.name} vs ${team2.name}`);

  // 5. События матча (голы)
  const playersTeam1 = await prisma.player.findMany({ where: { teamId: team1.id } });
  const playersTeam2 = await prisma.player.findMany({ where: { teamId: team2.id } });

  await prisma.matchEvent.create({
    data: {
      matchId: match.id,
      playerId: playersTeam1[0].id, // Иван Кодов
      type: EventType.GOAL,
      minute: 23,
      comment: 'Удар из-за пределов штрафной',
    },
  });

  await prisma.matchEvent.create({
    data: {
      matchId: match.id,
      playerId: playersTeam2[0].id, // Сергей Багов
      type: EventType.GOAL,
      minute: 45,
      comment: 'Гол с пенальти',
    },
  });

  await prisma.matchEvent.create({
    data: {
      matchId: match.id,
      playerId: playersTeam1[1].id, // Петр Багов
      type: EventType.GOAL,
      minute: 78,
      comment: 'Гол головой после навеса',
    },
  });

  console.log('✅ События матча добавлены');

  // 6. Обновление статуса матча на CONFIRMED (для демонстрации расчёта таблицы)
  await prisma.match.update({
    where: { id: match.id },
    data: { status: MatchStatus.CONFIRMED },
  });

  console.log('✅ Матч подтверждён');
  console.log('🎉 Наполнение базы данных завершено успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при наполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
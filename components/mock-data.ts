export type UserRole =
  | "admin"
  | "organizer"
  | "referee"
  | "coach"
  | "fan";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  team?: string;
};

export type TournamentStatus =
  | "Идёт регистрация"
  | "Матчи опубликованы"
  | "Активен"
  | "Завершён";

export type Tournament = {
  id: string;
  name: string;
  format: string;
  startDate: string;
  endDate: string;
  groups: number;
  teams: number;
  matches: number;
  status: TournamentStatus;
};

export type MatchStatus =
  | "Запланирован"
  | "Черновик"
  | "Требует подтверждения"
  | "Подтверждён";

export type MatchEventType = "goal" | "yellow" | "red";

export type MatchRecord = {
  id: string;
  tournamentId: string;
  date: string;
  time: string;
  home: string;
  away: string;
  venue: string;
  referee: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  eventMinute?: number;
  eventType?: MatchEventType;
  comment?: string;
};

export type StandingRecord = {
  position: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goals: string;
  diff: number;
  points: number;
};

export type PlayerRecord = {
  id: string;
  name: string;
  number: number;
  team: string;
  goals: number;
  yellow: number;
  red: number;
};

export type ApplicationStatus =
  | "На рассмотрении"
  | "Одобрена"
  | "Отклонена";

export type ApplicationRecord = {
  id: string;
  team: string;
  city: string;
  coach: string;
  playersCount: number;
  tournament: string;
  status: ApplicationStatus;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  organizer: "Организатор",
  referee: "Судья",
  coach: "Тренер",
  fan: "Игрок / Болельщик",
};

export const demoUsers: DemoUser[] = [
  {
    id: "U-001",
    name: "Алексей Румянцев",
    email: "organizer@tournament.ru",
    password: "Test123!",
    role: "organizer",
  },
  {
    id: "U-002",
    name: "Сергей Судья",
    email: "referee@tournament.ru",
    password: "Test123!",
    role: "referee",
  },
  {
    id: "U-003",
    name: "Андрей Смирнов",
    email: "coach@tournament.ru",
    password: "Test123!",
    role: "coach",
    team: "Уралец",
  },
  {
    id: "U-004",
    name: "Мария Админ",
    email: "admin@tournament.ru",
    password: "Test123!",
    role: "admin",
  },
  {
    id: "U-005",
    name: "Максим Болельщик",
    email: "fan@tournament.ru",
    password: "Test123!",
    role: "fan",
    team: "Уралец",
  },
];

export const initialTournaments: Tournament[] = [
  {
    id: "T-001",
    name: "Весенний кубок Екатеринбурга",
    format: "Групповой этап + плей-офф",
    startDate: "2026-04-14",
    endDate: "2026-05-28",
    groups: 2,
    teams: 12,
    matches: 18,
    status: "Идёт регистрация",
  },
  {
    id: "T-002",
    name: "Лига студенческих команд",
    format: "Круговая система",
    startDate: "2026-05-01",
    endDate: "2026-06-20",
    groups: 1,
    teams: 8,
    matches: 28,
    status: "Матчи опубликованы",
  },
];

export const initialMatches: MatchRecord[] = [
  {
    id: "M-101",
    tournamentId: "T-001",
    date: "2026-04-16",
    time: "18:30",
    home: "Уралец",
    away: "Факел-М",
    venue: "Стадион Юность",
    referee: "Сергей Судья",
    status: "Требует подтверждения",
    homeScore: 2,
    awayScore: 1,
    eventMinute: 74,
    eventType: "goal",
    comment: "Результат внесён после финального свистка",
  },
  {
    id: "M-102",
    tournamentId: "T-002",
    date: "2026-04-17",
    time: "20:00",
    home: "Смена",
    away: "Вектор",
    venue: "Манеж Восток",
    referee: "Сергей Судья",
    status: "Запланирован",
    homeScore: 0,
    awayScore: 0,
  },
  {
    id: "M-103",
    tournamentId: "T-001",
    date: "2026-04-19",
    time: "16:00",
    home: "Уралец",
    away: "Спартак-Юниор",
    venue: "Стадион Динамо",
    referee: "Сергей Судья",
    status: "Подтверждён",
    homeScore: 3,
    awayScore: 0,
    eventMinute: 61,
    eventType: "goal",
    comment: "Организатор подтвердил без замечаний",
  },
];

export const initialStandings: StandingRecord[] = [
  {
    position: 1,
    team: "Уралец",
    played: 4,
    won: 3,
    draw: 1,
    lost: 0,
    goals: "10-4",
    diff: 6,
    points: 10,
  },
  {
    position: 2,
    team: "Вектор",
    played: 4,
    won: 3,
    draw: 0,
    lost: 1,
    goals: "8-5",
    diff: 3,
    points: 9,
  },
  {
    position: 3,
    team: "Факел-М",
    played: 4,
    won: 1,
    draw: 2,
    lost: 1,
    goals: "6-6",
    diff: 0,
    points: 5,
  },
  {
    position: 4,
    team: "Смена",
    played: 4,
    won: 0,
    draw: 1,
    lost: 3,
    goals: "3-12",
    diff: -9,
    points: 1,
  },
];

export const initialPlayers: PlayerRecord[] = [
  {
    id: "P-001",
    name: "Иван Петров",
    number: 9,
    team: "Уралец",
    goals: 5,
    yellow: 1,
    red: 0,
  },
  {
    id: "P-002",
    name: "Максим Орлов",
    number: 10,
    team: "Вектор",
    goals: 4,
    yellow: 0,
    red: 0,
  },
  {
    id: "P-003",
    name: "Артём Левин",
    number: 7,
    team: "Факел-М",
    goals: 2,
    yellow: 2,
    red: 0,
  },
  {
    id: "P-004",
    name: "Дмитрий Соколов",
    number: 3,
    team: "Смена",
    goals: 1,
    yellow: 1,
    red: 1,
  },
];

export const initialApplications: ApplicationRecord[] = [
  {
    id: "A-201",
    team: "Уралец",
    city: "Екатеринбург",
    coach: "Андрей Смирнов",
    playersCount: 18,
    tournament: "Весенний кубок Екатеринбурга",
    status: "На рассмотрении",
  },
  {
    id: "A-202",
    team: "Факел-М",
    city: "Екатеринбург",
    coach: "Игорь Лаптев",
    playersCount: 16,
    tournament: "Лига студенческих команд",
    status: "Одобрена",
  },
];

export const frontendScope = [
  "Авторизация и разграничение интерфейса по ролям",
  "Формы создания турнира, подачи заявки и ввода результата",
  "Турнирная таблица, расписание и статистика игроков",
  "Адаптивность для телефона судьи и десктопа организатора",
  "Подготовка интерфейса к ручному тестированию и Selenium",
];

export const dashboardCardsByRole: Record<
  UserRole,
  { title: string; value: string; caption: string }[]
> = {
  admin: [
    { title: "Пользователи", value: "48", caption: "активных аккаунтов" },
    { title: "Роли", value: "5", caption: "типов доступа" },
    {
      title: "Безопасность",
      value: "RBAC",
      caption: "контроль доступа включён",
    },
  ],
  organizer: [
    { title: "Турниры", value: "2", caption: "активных соревнования" },
    { title: "Матчи", value: "46", caption: "в календаре турниров" },
    { title: "Заявки", value: "7", caption: "ожидают решения" },
  ],
  referee: [
    { title: "Сегодня", value: "3", caption: "матча на судействе" },
    { title: "Черновики", value: "1", caption: "результат ждёт отправки" },
    {
      title: "Подтверждение",
      value: "2",
      caption: "матча ждут организатора",
    },
  ],
  coach: [
    { title: "Команда", value: "18", caption: "игроков в заявке" },
    { title: "Ближайший матч", value: "16.04", caption: "против Факел-М" },
    { title: "Статистика", value: "5", caption: "голов у лучшего бомбардира" },
  ],
  fan: [
    { title: "Матчи команды", value: "4", caption: "в этом месяце" },
    { title: "Место", value: "1", caption: "в турнирной таблице" },
    { title: "Голы", value: "10", caption: "забито в турнире" },
  ],
};

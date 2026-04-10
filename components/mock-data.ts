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

export const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  organizer: "Организатор",
  referee: "Судья",
  coach: "Тренер",
  fan: "Игрок / Болельщик",
};

export const tournaments = [
  {
    id: "T-001",
    name: "Весенний кубок Екатеринбурга",
    format: "Групповой этап + плей-офф",
    dates: "14.04.2026 - 28.05.2026",
    status: "Идёт регистрация",
    teams: 12,
    matches: 18,
  },
  {
    id: "T-002",
    name: "Лига студенческих команд",
    format: "Круговая система",
    dates: "01.05.2026 - 20.06.2026",
    status: "Матчи опубликованы",
    teams: 8,
    matches: 28,
  },
];

export const matches = [
  {
    id: "M-101",
    date: "16.04.2026",
    time: "18:30",
    home: "Уралец",
    away: "Факел-М",
    venue: "Стадион Юность",
    referee: "Сергей Судья",
    status: "Требует подтверждения",
  },
  {
    id: "M-102",
    date: "17.04.2026",
    time: "20:00",
    home: "Смена",
    away: "Вектор",
    venue: "Манеж Восток",
    referee: "Сергей Судья",
    status: "Запланирован",
  },
  {
    id: "M-103",
    date: "19.04.2026",
    time: "16:00",
    home: "Уралец",
    away: "Спартак-Юниор",
    venue: "Стадион Динамо",
    referee: "Сергей Судья",
    status: "Подтверждён",
  },
];

export const standings = [
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

export const players = [
  {
    name: "Иван Петров",
    number: 9,
    team: "Уралец",
    goals: 5,
    yellow: 1,
    red: 0,
  },
  {
    name: "Максим Орлов",
    number: 10,
    team: "Вектор",
    goals: 4,
    yellow: 0,
    red: 0,
  },
  {
    name: "Артём Левин",
    number: 7,
    team: "Факел-М",
    goals: 2,
    yellow: 2,
    red: 0,
  },
];

export const applications = [
  {
    id: "A-201",
    team: "Уралец",
    coach: "Андрей Смирнов",
    tournament: "Весенний кубок Екатеринбурга",
    status: "На рассмотрении",
  },
  {
    id: "A-202",
    team: "Факел-М",
    coach: "Игорь Лаптев",
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
    { title: "Безопасность", value: "RBAC", caption: "контроль доступа включён" },
  ],
  organizer: [
    { title: "Турниры", value: "2", caption: "активных соревнования" },
    { title: "Матчи", value: "46", caption: "в календаре турниров" },
    { title: "Заявки", value: "7", caption: "ожидают решения" },
  ],
  referee: [
    { title: "Сегодня", value: "3", caption: "матча на судействе" },
    { title: "Черновики", value: "1", caption: "результат ждёт отправки" },
    { title: "Подтверждение", value: "2", caption: "матча ждут организатора" },
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

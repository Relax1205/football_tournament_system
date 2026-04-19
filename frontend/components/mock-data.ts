export type UserRole = "admin" | "organizer" | "referee" | "coach" | "fan";

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
  | "Завершён"
  | "Отменён";

export type Tournament = {
  id: string;
  name: string;
  format: string;
  startDate: string;
  endDate: string;
  groups: number;
  teams: number;
  matches: number;
  applications?: number;
  status: TournamentStatus;
  apiStatus?: string;
  description?: string;
};

export type MatchStatus =
  | "Запланирован"
  | "Требует подтверждения"
  | "Подтверждён"
  | "Отменён";

export type MatchEventType = "goal" | "yellow" | "red" | "substitution";

export type MatchEventRecord = {
  id: string;
  minute: number;
  type: MatchEventType;
  playerId: string;
  playerName: string;
  teamId?: string;
  comment?: string;
};

export type MatchRecord = {
  id: string;
  tournamentId: string;
  tournament?: string;
  date: string;
  time: string;
  home: string;
  away: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  referee: string;
  refereeId?: string;
  status: MatchStatus;
  apiStatus?: string;
  homeScore: number;
  awayScore: number;
  events?: MatchEventRecord[];
};

export type StandingRecord = {
  id?: string;
  tournamentId?: string;
  teamId: string;
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
  firstName: string;
  lastName: string;
  name: string;
  number: number | null;
  teamId: string;
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
  tournamentId: string;
  status: ApplicationStatus;
  approvedTeamId?: string | null;
};

export type TeamRecord = {
  id: string;
  name: string;
  city?: string;
  tournamentId: string;
  coachId?: string;
  coachName?: string;
  playersCount: number;
  players?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    number: number | null;
  }>;
};

export type NotificationKind = "info" | "success" | "warning";

export type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  isRead: boolean;
  createdAt: string;
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
    id: "demo-organizer",
    name: "Мария Организатор",
    email: "org@tournament.ru",
    password: "Test123!",
    role: "organizer",
  },
  {
    id: "demo-referee",
    name: "Сергей Судья",
    email: "referee@tournament.ru",
    password: "Test123!",
    role: "referee",
  },
  {
    id: "demo-coach",
    name: "Алексей Тренер",
    email: "coach@tournament.ru",
    password: "Test123!",
    role: "coach",
    team: "Uralets",
  },
  {
    id: "demo-admin",
    name: "Иван Администратор",
    email: "admin@tournament.ru",
    password: "Test123!",
    role: "admin",
  },
  {
    id: "demo-fan",
    name: "Максим Болельщик",
    email: "fan@tournament.ru",
    password: "Test123!",
    role: "fan",
    team: "FC Programmers",
  },
];

export const tournamentStatusOptions: TournamentStatus[] = [
  "Идёт регистрация",
  "Матчи опубликованы",
  "Активен",
  "Завершён",
  "Отменён",
];

export const backendTournamentStatusToLabel: Record<string, TournamentStatus> = {
  DRAFT: "Идёт регистрация",
  REGISTRATION_OPEN: "Идёт регистрация",
  IN_PROGRESS: "Активен",
  FINISHED: "Завершён",
  CANCELLED: "Отменён",
};

export const labelToBackendTournamentStatus: Record<TournamentStatus, string> = {
  "Идёт регистрация": "REGISTRATION_OPEN",
  "Матчи опубликованы": "IN_PROGRESS",
  "Активен": "IN_PROGRESS",
  "Завершён": "FINISHED",
  "Отменён": "CANCELLED",
};

export const backendTournamentFormatToLabel: Record<string, string> = {
  LEAGUE: "Круговая система",
  KNOCKOUT: "Плей-офф",
  GROUPS: "Группы + плей-офф",
};

export const labelToBackendTournamentFormat: Record<string, string> = {
  "Круговая система": "LEAGUE",
  "Плей-офф": "KNOCKOUT",
  "Группы + плей-офф": "GROUPS",
  "Групповой этап + плей-офф": "GROUPS",
};

export const backendMatchStatusToLabel: Record<string, MatchStatus> = {
  SCHEDULED: "Запланирован",
  AWAITING_CONFIRMATION: "Требует подтверждения",
  CONFIRMED: "Подтверждён",
  CANCELLED: "Отменён",
};

export const backendApplicationStatusToLabel: Record<string, ApplicationStatus> = {
  PENDING: "На рассмотрении",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
};

export const labelToBackendApplicationStatus: Record<ApplicationStatus, string> = {
  "На рассмотрении": "PENDING",
  "Одобрена": "APPROVED",
  "Отклонена": "REJECTED",
};

export const labelToBackendUserRole: Record<UserRole, string> = {
  admin: "ADMIN",
  organizer: "ORGANIZER",
  referee: "REFEREE",
  coach: "COACH",
  fan: "VIEWER",
};

export function toFrontendRole(role: string): UserRole {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "ORGANIZER":
      return "organizer";
    case "REFEREE":
      return "referee";
    case "COACH":
      return "coach";
    default:
      return "fan";
  }
}

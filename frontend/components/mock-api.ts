"use client";

import {
  ApplicationRecord,
  ApplicationStatus,
  DemoUser,
  MatchEventRecord,
  MatchEventType,
  MatchRecord,
  MatchStatus,
  PlayerRecord,
  StandingRecord,
  TeamRecord,
  Tournament,
  TournamentStatus,
  UserRole,
  backendApplicationStatusToLabel,
  backendMatchStatusToLabel,
  backendTournamentFormatToLabel,
  backendTournamentStatusToLabel,
  labelToBackendApplicationStatus,
  labelToBackendTournamentFormat,
  labelToBackendTournamentStatus,
  labelToBackendUserRole,
  toFrontendRole,
} from "@/components/mock-data";

const TOKEN_KEY = "football-tournament-token";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type ApiUser = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

type ApiTournament = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  groups: number;
  format: string;
  status: string;
  _count?: {
    teams: number;
    matches: number;
    applications: number;
  };
};

type ApiTeam = {
  id: string;
  name: string;
  city?: string | null;
  tournamentId: string;
  coach?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  players?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    number?: number | null;
  }>;
};

type ApiMatchEvent = {
  id: string;
  minute: number;
  type: string;
  comment?: string | null;
  player: {
    id: string;
    firstName: string;
    lastName: string;
    number?: number | null;
    teamId?: string;
  };
};

type ApiMatch = {
  id: string;
  tournamentId: string;
  tournament?: {
    id: string;
    name: string;
  };
  date: string;
  venue?: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: {
    id: string;
    name: string;
  };
  awayTeam: {
    id: string;
    name: string;
  };
  referee?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  events?: ApiMatchEvent[];
};

type ApiStanding = {
  id: string;
  tournamentId: string;
  team: {
    id: string;
    name: string;
  };
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

type ApiPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  number?: number | null;
  team: {
    id: string;
    name: string;
  };
  goals: number;
  yellowCards: number;
  redCards: number;
};

type ApiApplication = {
  id: string;
  tournamentId: string;
  teamName: string;
  city?: string | null;
  coachName: string;
  playersCount: number;
  status: string;
  approvedTeamId?: string | null;
  tournament: {
    id: string;
    name: string;
  };
};

type CreateTournamentInput = {
  endDate: string;
  format: string;
  groups: number;
  name: string;
  startDate: string;
  status: TournamentStatus;
};

type CreateApplicationInput = {
  city: string;
  coach: string;
  playersCount: number;
  team: string;
  tournament: string;
};

export type CreateTeamInput = {
  city?: string;
  coachId?: string;
  name: string;
  tournamentId: string;
};

export type SaveMatchResultInput = {
  awayScore: number;
  comment: string;
  eventMinute?: number;
  eventType?: MatchEventType;
  homeScore: number;
  matchId: string;
  playerId?: string;
  status?: MatchStatus;
};

export type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  number?: number;
};

export type CreateMatchInput = {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  refereeId?: string;
  venue?: string;
  date: string;
};

export type GenerateScheduleInput = {
  tournamentId: string;
  startDate: string;
  daysBetweenRounds: number;
};

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

function toIsoDate(date: string) {
  if (date.includes("T")) {
    return new Date(date).toISOString();
  }

  return new Date(`${date}T12:00:00`).toISOString();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function mapEventType(type: string): MatchEventType {
  switch (type) {
    case "YELLOW_CARD":
      return "yellow";
    case "RED_CARD":
      return "red";
    case "SUBSTITUTION":
      return "substitution";
    default:
      return "goal";
  }
}

function mapTournament(item: ApiTournament): Tournament {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    format: backendTournamentFormatToLabel[item.format] ?? item.format,
    startDate: formatDate(item.startDate),
    endDate: formatDate(item.endDate),
    groups: item.groups,
    teams: item._count?.teams ?? 0,
    matches: item._count?.matches ?? 0,
    applications: item._count?.applications ?? 0,
    status: backendTournamentStatusToLabel[item.status] ?? "Идёт регистрация",
    apiStatus: item.status,
  };
}

function mapMatch(item: ApiMatch): MatchRecord {
  return {
    id: item.id,
    tournamentId: item.tournamentId,
    tournament: item.tournament?.name,
    date: formatDate(item.date),
    time: formatTime(item.date),
    home: item.homeTeam.name,
    away: item.awayTeam.name,
    homeTeamId: item.homeTeam.id,
    awayTeamId: item.awayTeam.id,
    venue: item.venue ?? "Стадион не указан",
    referee: item.referee?.name ?? item.referee?.email ?? "Не назначен",
    refereeId: item.referee?.id,
    status: backendMatchStatusToLabel[item.status] ?? "Запланирован",
    apiStatus: item.status,
    homeScore: item.homeScore,
    awayScore: item.awayScore,
    events: (item.events ?? []).map((event) => ({
      id: event.id,
      minute: event.minute,
      type: mapEventType(event.type),
      playerId: event.player.id,
      playerName: `${event.player.lastName} ${event.player.firstName}`,
      teamId: event.player.teamId,
      comment: event.comment ?? undefined,
    })),
  };
}

function mapStanding(item: ApiStanding, index: number): StandingRecord {
  return {
    id: item.id,
    tournamentId: item.tournamentId,
    teamId: item.team.id,
    position: index + 1,
    team: item.team.name,
    played: item.gamesPlayed,
    won: item.wins,
    draw: item.draws,
    lost: item.losses,
    goals: `${item.goalsFor}-${item.goalsAgainst}`,
    diff: item.goalDifference,
    points: item.points,
  };
}

function mapPlayer(item: ApiPlayer): PlayerRecord {
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    name: `${item.lastName} ${item.firstName}`,
    number: item.number ?? null,
    teamId: item.team.id,
    team: item.team.name,
    goals: item.goals,
    yellow: item.yellowCards,
    red: item.redCards,
  };
}

function mapApplication(item: ApiApplication): ApplicationRecord {
  return {
    id: item.id,
    team: item.teamName,
    city: item.city ?? "",
    coach: item.coachName,
    playersCount: item.playersCount,
    tournament: item.tournament.name,
    tournamentId: item.tournament.id,
    status: backendApplicationStatusToLabel[item.status] ?? "На рассмотрении",
    approvedTeamId: item.approvedTeamId,
  };
}

function mapUser(item: ApiUser): DemoUser {
  return {
    id: item.id,
    name: item.name ?? item.email,
    email: item.email,
    password: "",
    role: toFrontendRole(item.role),
  };
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  allowUnauthorized = false,
): Promise<T> {
  const token = getToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (allowUnauthorized && (response.status === 401 || response.status === 403)) {
    return [] as T;
  }

  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? "Request failed");
  }

  return body.data;
}

async function resolveTournamentId(value: string) {
  const tournaments = await listTournaments();
  const match = tournaments.find((item) => item.id === value || item.name === value);

  if (!match) {
    throw new Error("Турнир не найден");
  }

  return match.id;
}

async function getDefaultTournamentId() {
  const tournaments = await listTournaments();
  return tournaments[0]?.id;
}

export async function loginUser(email: string, password: string) {
  const result = await requestJson<{ token: string; user: ApiUser }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );

  return {
    token: result.token,
    user: {
      ...mapUser(result.user),
      password: "",
    },
  };
}

export async function listTournaments() {
  const items = await requestJson<ApiTournament[]>("/api/tournaments");
  return items.map(mapTournament);
}

export async function createTournament(input: CreateTournamentInput) {
  const created = await requestJson<ApiTournament>(
    "/api/tournaments",
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: "",
        startDate: toIsoDate(input.startDate),
        endDate: toIsoDate(input.endDate),
        groups: input.groups,
        format: labelToBackendTournamentFormat[input.format] ?? "GROUPS",
        status: labelToBackendTournamentStatus[input.status],
      }),
    },
  );

  return mapTournament(created);
}

export async function createTeam(input: CreateTeamInput) {
  const created = await requestJson<ApiTeam>(
    "/api/teams",
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        city: input.city,
        coachId: input.coachId || null,
        tournamentId: input.tournamentId,
      }),
    },
  );

  return {
    id: created.id,
    name: created.name,
    city: created.city ?? undefined,
    tournamentId: created.tournamentId,
    coachName: created.coach?.name ?? created.coach?.email,
    playersCount: created.players?.length ?? 0,
    players: created.players?.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number ?? null,
    })),
  } as TeamRecord;
}

export async function listMatches(tournamentId?: string) {
  const query = tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : "";
  const matches = await requestJson<ApiMatch[]>(`/api/matches${query}`);
  return matches.map(mapMatch);
}

export async function createMatch(input: CreateMatchInput) {
  const match = await requestJson<ApiMatch>(
    "/api/matches",
    {
      method: "POST",
      body: JSON.stringify({
        ...input,
        date: toIsoDate(input.date),
      }),
    },
  );

  return mapMatch(match);
}

export async function saveMatchResult(input: SaveMatchResultInput) {
  const savedMatch = await requestJson<ApiMatch>(
    `/api/matches/${input.matchId}/score`,
    {
      method: "PUT",
      body: JSON.stringify({
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      }),
    },
  );

  if (input.playerId && input.eventMinute && input.eventType) {
    await requestJson<MatchEventRecord>(
      "/api/match-events",
      {
        method: "POST",
        body: JSON.stringify({
          matchId: input.matchId,
          playerId: input.playerId,
          minute: input.eventMinute,
          type:
            input.eventType === "yellow"
              ? "YELLOW_CARD"
              : input.eventType === "red"
                ? "RED_CARD"
                : input.eventType === "substitution"
                  ? "SUBSTITUTION"
                  : "GOAL",
          comment: input.comment || undefined,
        }),
      },
    );

    const refreshed = await listMatches(savedMatch.tournamentId);
    const updated = refreshed.find((item) => item.id === input.matchId);

    if (updated) {
      if (input.status === "Подтверждён") {
        return confirmMatch(input.matchId);
      }

      return updated;
    }
  }

  if (input.status === "Подтверждён") {
    return confirmMatch(input.matchId);
  }

  return mapMatch(savedMatch);
}

export async function confirmMatch(matchId: string) {
  const match = await requestJson<ApiMatch>(
    `/api/matches/${matchId}/confirm`,
    {
      method: "PATCH",
    },
  );

  return mapMatch(match);
}

export async function listStandings(tournamentId?: string) {
  const targetTournamentId = tournamentId ?? await getDefaultTournamentId();
  if (!targetTournamentId) {
    return [];
  }

  const standings = await requestJson<ApiStanding[]>(
    `/api/standings?tournamentId=${encodeURIComponent(targetTournamentId)}`,
  );

  return standings.map(mapStanding);
}

export async function calculateStandings(tournamentId: string) {
  const standings = await requestJson<ApiStanding[]>(
    "/api/standings/calculate",
    {
      method: "POST",
      body: JSON.stringify({ tournamentId }),
    },
  );

  return standings.map(mapStanding);
}

export async function listPlayers(tournamentId?: string) {
  const query = tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : "";
  const players = await requestJson<ApiPlayer[]>(`/api/players${query}`);
  return players.map(mapPlayer);
}

export async function listApplications(tournamentId?: string) {
  const query = tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : "";
  const applications = await requestJson<ApiApplication[]>(
    `/api/applications${query}`,
    undefined,
    true,
  );
  return applications.map(mapApplication);
}

export async function createApplication(input: CreateApplicationInput) {
  const tournamentId = await resolveTournamentId(input.tournament);
  const application = await requestJson<ApiApplication>(
    "/api/applications",
    {
      method: "POST",
      body: JSON.stringify({
        tournamentId,
        teamName: input.team,
        city: input.city,
        coachName: input.coach,
        playersCount: input.playersCount,
      }),
    },
  );

  return mapApplication(application);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
) {
  const application = await requestJson<ApiApplication>(
    `/api/applications/${applicationId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: labelToBackendApplicationStatus[status],
      }),
    },
  );

  return mapApplication(application);
}

export async function listUsers(role?: string) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  const users = await requestJson<ApiUser[]>(`/api/users${query}`, undefined, true);
  return users.map(mapUser);
}

export async function updateUserRole(userId: string, role: UserRole) {
  const user = await requestJson<ApiUser>(
    `/api/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role: labelToBackendUserRole[role],
      }),
    },
  );

  return mapUser(user);
}

export async function listTeams(tournamentId?: string) {
  const query = tournamentId ? `?tournamentId=${encodeURIComponent(tournamentId)}` : "";
  const teams = await requestJson<ApiTeam[]>(`/api/teams${query}`);

  return teams.map<TeamRecord>((team) => ({
    id: team.id,
    name: team.name,
    city: team.city ?? undefined,
    tournamentId: team.tournamentId,
    coachName: team.coach?.name ?? team.coach?.email,
    playersCount: team.players?.length ?? 0,
    players: team.players?.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number ?? null,
    })),
  }));
}

export async function addPlayer(teamId: string, input: CreatePlayerInput) {
  return requestJson(
    `/api/teams/${teamId}/players`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function generateSchedule(input: GenerateScheduleInput) {
  const matches = await requestJson<ApiMatch[]>(
    "/api/schedule/generate",
    {
      method: "POST",
      body: JSON.stringify({
        tournamentId: input.tournamentId,
        startDate: toIsoDate(input.startDate),
        daysBetweenRounds: input.daysBetweenRounds,
      }),
    },
  );

  return matches.map(mapMatch);
}

export function getMatchReportUrl(matchId: string) {
  return `/api/reports/matches/${matchId}/pdf`;
}

export function getStandingsExportUrl(tournamentId: string) {
  return `/api/reports/standings/${tournamentId}/excel`;
}

async function withFallback<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export async function getDashboardSnapshot() {
  const [applications, matches, tournaments, users] = await Promise.all([
    withFallback(() => listApplications(), [] as ApplicationRecord[]),
    withFallback(() => listMatches(), [] as MatchRecord[]),
    withFallback(() => listTournaments(), [] as Tournament[]),
    withFallback(() => listUsers(), [] as DemoUser[]),
  ]);

  return {
    applications,
    matches,
    tournaments,
    users,
  };
}

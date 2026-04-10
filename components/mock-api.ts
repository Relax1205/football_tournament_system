"use client";

import {
  ApplicationRecord,
  ApplicationStatus,
  DemoUser,
  MatchEventType,
  MatchRecord,
  MatchStatus,
  PlayerRecord,
  StandingRecord,
  Tournament,
  TournamentStatus,
  UserRole,
  demoUsers,
  initialApplications,
  initialMatches,
  initialPlayers,
  initialStandings,
  initialTournaments,
} from "@/components/mock-data";

type Database = {
  applications: ApplicationRecord[];
  matches: MatchRecord[];
  players: PlayerRecord[];
  standings: StandingRecord[];
  tournaments: Tournament[];
  users: DemoUser[];
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

type SaveMatchResultInput = {
  awayScore: number;
  comment: string;
  eventMinute: number;
  eventType: MatchEventType;
  homeScore: number;
  matchId: string;
  status: MatchStatus;
};

let database: Database = {
  applications: structuredClone(initialApplications),
  matches: structuredClone(initialMatches),
  players: structuredClone(initialPlayers),
  standings: structuredClone(initialStandings),
  tournaments: structuredClone(initialTournaments),
  users: structuredClone(demoUsers),
};

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

function clone<T>(value: T): T {
  return structuredClone(value);
}

export async function getDashboardSnapshot() {
  await wait();
  return clone(database);
}

export async function listTournaments() {
  await wait();
  return clone(database.tournaments);
}

export async function createTournament(input: CreateTournamentInput) {
  await wait();

  const tournament: Tournament = {
    id: `T-${String(database.tournaments.length + 1).padStart(3, "0")}`,
    name: input.name,
    format: input.format,
    startDate: input.startDate,
    endDate: input.endDate,
    groups: input.groups,
    teams: 0,
    matches: 0,
    status: input.status,
  };

  database = {
    ...database,
    tournaments: [tournament, ...database.tournaments],
  };

  return clone(tournament);
}

export async function listMatches() {
  await wait();
  return clone(database.matches);
}

export async function saveMatchResult(input: SaveMatchResultInput) {
  await wait();

  database = {
    ...database,
    matches: database.matches.map((match) =>
      match.id === input.matchId
        ? {
            ...match,
            awayScore: input.awayScore,
            comment: input.comment,
            eventMinute: input.eventMinute,
            eventType: input.eventType,
            homeScore: input.homeScore,
            status: input.status,
          }
        : match,
    ),
  };

  return clone(database.matches.find((match) => match.id === input.matchId)!);
}

export async function confirmMatch(matchId: string) {
  await wait();

  database = {
    ...database,
    matches: database.matches.map((match) =>
      match.id === matchId ? { ...match, status: "Подтверждён" } : match,
    ),
  };

  return clone(database.matches.find((match) => match.id === matchId)!);
}

export async function listStandings() {
  await wait();
  return clone(database.standings);
}

export async function listPlayers() {
  await wait();
  return clone(database.players);
}

export async function listApplications() {
  await wait();
  return clone(database.applications);
}

export async function createApplication(input: CreateApplicationInput) {
  await wait();

  const application: ApplicationRecord = {
    id: `A-${String(database.applications.length + 201).padStart(3, "0")}`,
    status: "На рассмотрении",
    ...input,
  };

  database = {
    ...database,
    applications: [application, ...database.applications],
  };

  return clone(application);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
) {
  await wait();

  database = {
    ...database,
    applications: database.applications.map((application) =>
      application.id === applicationId ? { ...application, status } : application,
    ),
  };

  return clone(
    database.applications.find((application) => application.id === applicationId)!,
  );
}

export async function listUsers() {
  await wait();
  return clone(database.users);
}

export async function updateUserRole(userId: string, role: UserRole) {
  await wait();

  database = {
    ...database,
    users: database.users.map((user) =>
      user.id === userId ? { ...user, role } : user,
    ),
  };

  return clone(database.users.find((user) => user.id === userId)!);
}

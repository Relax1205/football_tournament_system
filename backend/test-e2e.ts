import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const DEMO_PASSWORD = 'Test123!';

type AuthSession = {
  token: string;
};

type LoginResponse = {
  data: {
    token: string;
  };
};

type TournamentResponse = {
  data: {
    id: string;
    name: string;
  };
};

type ApplicationResponse = {
  data: {
    id: string;
    teamName: string;
    approvedTeamId?: string | null;
  };
};

type TeamResponse = {
  data: {
    id: string;
    name: string;
    coach?: {
      email: string;
    } | null;
  };
};

type MatchResponse = {
  data: {
    id: string;
    status: string;
  };
};

type PlayerResponse = {
  data: {
    id: string;
  };
};

function log(message: string) {
  console.log(`[e2e] ${message}`);
}

async function request<T>(path: string, config?: AxiosRequestConfig) {
  const response = await axios.request<{ success: boolean; data: T; error?: string }>({
    baseURL: API_URL,
    url: path,
    validateStatus: () => true,
    ...config,
  });

  if (response.status >= 400 || !response.data?.success) {
    throw new Error(response.data?.error ?? `Request failed: ${response.status} ${path}`);
  }

  return response.data.data;
}

async function login(email: string, password = DEMO_PASSWORD): Promise<AuthSession> {
  const result = await request<LoginResponse['data']>('/auth/login', {
    method: 'POST',
    data: { email, password },
  });

  return { token: result.token };
}

function authConfig(session: AuthSession): AxiosRequestConfig {
  return {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  };
}

async function main() {
  log(`Using API ${API_URL}`);

  const admin = await login('admin@tournament.ru');
  const organizer = await login('org@tournament.ru');
  const referee = await login('referee@tournament.ru');
  const coach = await login('coach@tournament.ru');
  const coach2 = await login('coach2@team.ru');
  const fan = await login('fan@tournament.ru');

  log('Creating a new tournament as organizer');
  const tournament = await request<TournamentResponse['data']>('/tournaments', {
    method: 'POST',
    ...authConfig(organizer),
    data: {
      name: `Smoke Cup ${Date.now()}`,
      description: 'Automated smoke verification',
      startDate: '2026-08-01T12:00:00.000Z',
      endDate: '2026-08-20T12:00:00.000Z',
      format: 'GROUPS',
      groups: 1,
      status: 'REGISTRATION_OPEN',
    },
  });

  log('Submitting two team applications as coaches');
  const application1 = await request<ApplicationResponse['data']>('/applications', {
    method: 'POST',
    ...authConfig(coach),
    data: {
      tournamentId: tournament.id,
      teamName: `North Legion ${Date.now()}`,
      city: 'Moscow',
      coachName: 'Alexey Coach',
      playersCount: 18,
    },
  });

  const application2 = await request<ApplicationResponse['data']>('/applications', {
    method: 'POST',
    ...authConfig(coach2),
    data: {
      tournamentId: tournament.id,
      teamName: `South Legion ${Date.now()}`,
      city: 'Kazan',
      coachName: 'Dmitry Coach',
      playersCount: 16,
    },
  });

  log('Approving both applications as organizer');
  const approvedApplication1 = await request<ApplicationResponse['data']>(`/applications/${application1.id}/status`, {
    method: 'PATCH',
    ...authConfig(organizer),
    data: { status: 'APPROVED' },
  });

  const approvedApplication2 = await request<ApplicationResponse['data']>(`/applications/${application2.id}/status`, {
    method: 'PATCH',
    ...authConfig(organizer),
    data: { status: 'APPROVED' },
  });

  if (!approvedApplication1.approvedTeamId || !approvedApplication2.approvedTeamId) {
    throw new Error('Applications were approved without creating teams');
  }

  log('Checking that RBAC blocks a viewer from editing match results');
  const forbiddenResponse = await axios.put(
    `${API_URL}/matches/non-existent/score`,
    { homeScore: 1, awayScore: 0 },
    {
      validateStatus: () => true,
      headers: {
        Authorization: `Bearer ${fan.token}`,
      },
    },
  );

  if (forbiddenResponse.status !== 403) {
    throw new Error(`Expected 403 for viewer score update, got ${forbiddenResponse.status}`);
  }

  log('Loading teams and adding players as the team coaches');
  const teams = await request<TeamResponse['data'][]>('/teams', {
    method: 'GET',
    ...authConfig(organizer),
    params: { tournamentId: tournament.id },
  });

  const coachTeam = teams.find((team) => team.id === approvedApplication1.approvedTeamId);
  const coach2Team = teams.find((team) => team.id === approvedApplication2.approvedTeamId);

  if (!coachTeam || !coach2Team) {
    throw new Error('Approved teams are missing from /teams');
  }

  const coachPlayer = await request<PlayerResponse['data']>(`/teams/${coachTeam.id}/players`, {
    method: 'POST',
    ...authConfig(coach),
    data: {
      firstName: 'Ivan',
      lastName: 'Forward',
      number: 9,
    },
  });

  await request<PlayerResponse['data']>(`/teams/${coach2Team.id}/players`, {
    method: 'POST',
    ...authConfig(coach2),
    data: {
      firstName: 'Pavel',
      lastName: 'Keeper',
      number: 1,
    },
  });

  log('Generating a round-robin schedule');
  const matches = await request<MatchResponse['data'][]>('/schedule/generate', {
    method: 'POST',
    ...authConfig(organizer),
    data: {
      tournamentId: tournament.id,
      startDate: '2026-08-03T12:00:00.000Z',
      daysBetweenRounds: 2,
    },
  });

  if (matches.length === 0) {
    throw new Error('Schedule generation returned no matches');
  }

  const match = matches[0];

  log('Saving match result as referee and adding a goal event');
  await request<MatchResponse['data']>(`/matches/${match.id}/score`, {
    method: 'PUT',
    ...authConfig(referee),
    data: {
      homeScore: 2,
      awayScore: 1,
    },
  });

  await request('/match-events', {
    method: 'POST',
    ...authConfig(referee),
    data: {
      matchId: match.id,
      playerId: coachPlayer.id,
      minute: 57,
      type: 'GOAL',
      comment: 'Smoke test goal',
    },
  });

  log('Confirming the match result as organizer');
  const confirmedMatch = await request<MatchResponse['data']>(`/matches/${match.id}/confirm`, {
    method: 'PATCH',
    ...authConfig(organizer),
  });

  if (confirmedMatch.status !== 'CONFIRMED') {
    throw new Error(`Expected confirmed match status, got ${confirmedMatch.status}`);
  }

  log('Updating a role as admin');
  const users = await request<Array<{ id: string; email: string; role: string }>>('/users', {
    method: 'GET',
    ...authConfig(admin),
  });
  const fanUser = users.find((user) => user.email === 'fan@tournament.ru');

  if (!fanUser) {
    throw new Error('Unable to load demo viewer account');
  }

  await request(`/users/${fanUser.id}/role`, {
    method: 'PATCH',
    ...authConfig(admin),
    data: { role: 'VIEWER' },
  });

  log('Checking standings and report exports');
  const standings = await request<Array<{ team: { name: string }; points: number }>>('/standings', {
    method: 'GET',
    params: { tournamentId: tournament.id },
  });

  if (standings.length < 2 || standings[0].points < 3) {
    throw new Error('Standings were not recalculated correctly');
  }

  const pdfResponse = await axios.get(`${API_URL}/reports/matches/${match.id}/pdf`, {
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

  if (pdfResponse.status !== 200 || !String(pdfResponse.headers['content-type']).includes('application/pdf')) {
    throw new Error('Match PDF export failed');
  }

  const excelResponse = await axios.get(`${API_URL}/reports/standings/${tournament.id}/excel`, {
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

  if (
    excelResponse.status !== 200 ||
    !String(excelResponse.headers['content-type']).includes(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  ) {
    throw new Error('Standings Excel export failed');
  }

  log('Smoke test completed successfully');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

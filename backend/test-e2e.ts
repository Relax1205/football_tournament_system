import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const DEMO_PASSWORD = 'Test123!';

type AuthSession = {
  token: string;
};

type TournamentResponse = {
  id: string;
  name: string;
};

type ApplicationResponse = {
  id: string;
  teamName: string;
  approvedTeamId?: string | null;
};

type TeamResponse = {
  id: string;
  name: string;
  coach?: {
    email: string;
  } | null;
};

type MatchResponse = {
  id: string;
  status: string;
};

type PlayerResponse = {
  id: string;
};

type RegisteredUserResponse = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

type NotificationResponse = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
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
  const result = await request<{ token: string }>('/auth/login', {
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

  const uniqueSuffix = Date.now().toString();
  const admin = await login('admin@tournament.ru');
  const organizer = await login('org@tournament.ru');
  const referee = await login('referee@tournament.ru');
  const coach = await login('coach@tournament.ru');
  const coach2 = await login('coach2@team.ru');
  const fan = await login('fan@tournament.ru');

  log('Registering a new viewer account');
  const registeredEmail = `viewer-${uniqueSuffix}@example.com`;
  const registeredName = `Auto Viewer ${uniqueSuffix.slice(-4)}`;
  const registeredUser = await request<RegisteredUserResponse>('/auth/register', {
    method: 'POST',
    data: {
      email: registeredEmail,
      password: DEMO_PASSWORD,
      name: registeredName,
    },
  });

  if (registeredUser.role !== 'VIEWER') {
    throw new Error(`Expected VIEWER role after registration, got ${registeredUser.role}`);
  }

  const registeredViewer = await login(registeredEmail);

  log('Checking welcome and admin notifications');
  const viewerNotifications = await request<NotificationResponse[]>('/notifications', {
    method: 'GET',
    ...authConfig(registeredViewer),
  });
  const welcomeNotification = viewerNotifications.find((notification) =>
    notification.title.includes('Добро'),
  );

  if (!welcomeNotification) {
    throw new Error('Newly registered viewer did not receive a welcome notification');
  }

  const adminNotifications = await request<NotificationResponse[]>('/notifications', {
    method: 'GET',
    ...authConfig(admin),
  });
  const registrationNotification = adminNotifications.find(
    (notification) =>
      notification.title.includes('Новая регистрация') &&
      notification.message.includes(registeredName),
  );

  if (!registrationNotification) {
    throw new Error('Admin did not receive a notification about the new registration');
  }

  await request<NotificationResponse>(`/notifications/${registrationNotification.id}/read`, {
    method: 'PATCH',
    ...authConfig(admin),
  });

  const adminNotificationsAfterRead = await request<NotificationResponse[]>('/notifications', {
    method: 'GET',
    ...authConfig(admin),
  });
  const readNotification = adminNotificationsAfterRead.find(
    (notification) => notification.id === registrationNotification.id,
  );

  if (!readNotification?.isRead) {
    throw new Error('Notification read action did not persist');
  }

  await request<{ id: string }>(`/notifications/${registrationNotification.id}`, {
    method: 'DELETE',
    ...authConfig(admin),
  });

  const adminNotificationsAfterDelete = await request<NotificationResponse[]>('/notifications', {
    method: 'GET',
    ...authConfig(admin),
  });

  if (adminNotificationsAfterDelete.some((notification) => notification.id === registrationNotification.id)) {
    throw new Error('Notification delete action did not remove the item');
  }

  log('Creating a new tournament as organizer');
  const tournament = await request<TournamentResponse>('/tournaments', {
    method: 'POST',
    ...authConfig(organizer),
    data: {
      name: `Smoke Cup ${uniqueSuffix}`,
      description: 'Automated smoke verification',
      startDate: '2026-08-01T12:00:00.000Z',
      endDate: '2026-08-20T12:00:00.000Z',
      format: 'GROUPS',
      groups: 1,
      status: 'REGISTRATION_OPEN',
    },
  });

  log('Submitting two team applications as coaches');
  const application1 = await request<ApplicationResponse>('/applications', {
    method: 'POST',
    ...authConfig(coach),
    data: {
      tournamentId: tournament.id,
      teamName: `North Legion ${uniqueSuffix}`,
      city: 'Moscow',
      coachName: 'Alexey Coach',
      playersCount: 18,
    },
  });

  const application2 = await request<ApplicationResponse>('/applications', {
    method: 'POST',
    ...authConfig(coach2),
    data: {
      tournamentId: tournament.id,
      teamName: `South Legion ${uniqueSuffix}`,
      city: 'Kazan',
      coachName: 'Dmitry Coach',
      playersCount: 16,
    },
  });

  log('Approving both applications as organizer');
  const approvedApplication1 = await request<ApplicationResponse>(`/applications/${application1.id}/status`, {
    method: 'PATCH',
    ...authConfig(organizer),
    data: { status: 'APPROVED' },
  });

  const approvedApplication2 = await request<ApplicationResponse>(`/applications/${application2.id}/status`, {
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
  const teams = await request<TeamResponse[]>('/teams', {
    method: 'GET',
    ...authConfig(organizer),
    params: { tournamentId: tournament.id },
  });

  const coachTeam = teams.find((team) => team.id === approvedApplication1.approvedTeamId);
  const coach2Team = teams.find((team) => team.id === approvedApplication2.approvedTeamId);

  if (!coachTeam || !coach2Team) {
    throw new Error('Approved teams are missing from /teams');
  }

  const coachPlayer = await request<PlayerResponse>(`/teams/${coachTeam.id}/players`, {
    method: 'POST',
    ...authConfig(coach),
    data: {
      firstName: 'Ivan',
      lastName: 'Forward',
      number: 9,
    },
  });

  await request<PlayerResponse>(`/teams/${coach2Team.id}/players`, {
    method: 'POST',
    ...authConfig(coach2),
    data: {
      firstName: 'Pavel',
      lastName: 'Keeper',
      number: 1,
    },
  });

  log('Generating a round-robin schedule twice and keeping previous matches');
  const firstSchedule = await request<MatchResponse[]>('/schedule/generate', {
    method: 'POST',
    ...authConfig(organizer),
    data: {
      tournamentId: tournament.id,
      startDate: '2026-08-03T12:00:00.000Z',
      daysBetweenRounds: 2,
    },
  });

  if (firstSchedule.length === 0) {
    throw new Error('Schedule generation returned no matches');
  }

  const firstMatchIds = new Set(firstSchedule.map((match) => match.id));
  const secondSchedule = await request<MatchResponse[]>('/schedule/generate', {
    method: 'POST',
    ...authConfig(organizer),
    data: {
      tournamentId: tournament.id,
      startDate: '2026-08-15T12:00:00.000Z',
      daysBetweenRounds: 2,
    },
  });

  if (secondSchedule.length <= firstSchedule.length) {
    throw new Error('Repeated schedule generation did not add new matches');
  }

  for (const matchId of firstMatchIds) {
    if (!secondSchedule.some((match) => match.id === matchId)) {
      throw new Error('Repeated schedule generation removed previously created matches');
    }
  }

  const match = firstSchedule[0];

  log('Saving match result as referee and adding a goal event');
  await request<MatchResponse>(`/matches/${match.id}/score`, {
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
  const confirmedMatch = await request<MatchResponse>(`/matches/${match.id}/confirm`, {
    method: 'PATCH',
    ...authConfig(organizer),
  });

  if (confirmedMatch.status !== 'CONFIRMED') {
    throw new Error(`Expected confirmed match status, got ${confirmedMatch.status}`);
  }

  log('Updating a role as admin and checking notification delivery');
  await request(`/users/${registeredUser.id}/role`, {
    method: 'PATCH',
    ...authConfig(admin),
    data: { role: 'COACH' },
  });

  const updatedUserSession = await login(registeredEmail);
  const notificationsAfterRoleChange = await request<NotificationResponse[]>('/notifications', {
    method: 'GET',
    ...authConfig(updatedUserSession),
  });
  const roleNotification = notificationsAfterRoleChange.find((notification) =>
    notification.title.includes('Роль обновлена'),
  );

  if (!roleNotification) {
    throw new Error('User did not receive a notification about the updated role');
  }

  log('Deleting the temporary user as admin and verifying access is revoked');
  const deletedUser = await request<RegisteredUserResponse>(`/users/${registeredUser.id}`, {
    method: 'DELETE',
    ...authConfig(admin),
  });

  if (deletedUser.id !== registeredUser.id) {
    throw new Error('Delete user API returned an unexpected user');
  }

  const usersAfterDelete = await request<Array<{ id: string; email: string }>>('/users', {
    method: 'GET',
    ...authConfig(admin),
  });

  if (usersAfterDelete.some((user) => user.id === registeredUser.id)) {
    throw new Error('Deleted user is still present in the users list');
  }

  const deletedLoginResponse = await axios.post(
    `${API_URL}/auth/login`,
    { email: registeredEmail, password: DEMO_PASSWORD },
    { validateStatus: () => true },
  );

  if (deletedLoginResponse.status !== 401) {
    throw new Error(`Expected 401 after deleting the user, got ${deletedLoginResponse.status}`);
  }

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

// football_tournament_system/frontend/src/lib/api.ts
import axios from 'axios';

// Базовый URL. Так как настроен rewrites в next.config.js, 
// мы используем относительный путь '/api', а Next.js сам перенаправит его на :4000
const API_URL = '/api'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления JWT токена в каждый запрос
api.interceptors.request.use((config) => {
  // Проверяем, что код выполняется в браузере
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// === Типы данных (интерфейсы) ===

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  format: 'LEAGUE' | 'KNOCKOUT' | 'GROUPS';
  status: 'DRAFT' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
}

export interface Team {
  id: string;
  name: string;
  city?: string;
  tournamentId: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number?: number;
  teamId: string;
}

export interface Match {
  id: string;
  date: string;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: Team;
  awayTeam: Team;
  tournamentId: string;
}

export interface Standing {
  id: string;
  team: Team;
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

// === Методы API ===

export const tournamentApi = {
  // GET /api/tournaments
  getAll: () => api.get<Tournament[]>('/tournaments').then(res => res.data.data),
  // GET /api/tournaments/:id
  getById: (id: string) => api.get<Tournament>(`/tournaments/${id}`).then(res => res.data.data),
  // POST /api/tournaments
  create: (data: Omit<Tournament, 'id'>) => api.post('/tournaments', data).then(res => res.data.data),
};

export const teamApi = {
  // GET /api/teams?tournamentId=...
  getByTournament: (tournamentId: string) => 
    api.get<Team[]>(`/teams?tournamentId=${tournamentId}`).then(res => res.data.data),
  // POST /api/teams
  create: (data: Omit<Team, 'id'>) => api.post('/teams', data).then(res => res.data.data),
  // POST /api/teams/:id/players
  addPlayer: (teamId: string, playerData: Omit<Player, 'id' | 'teamId'>) =>
    api.post(`/teams/${teamId}/players`, playerData).then(res => res.data.data),
};

export const matchApi = {
  // GET /api/matches?tournamentId=...
  getByTournament: (tournamentId: string) => 
    api.get<Match[]>(`/matches?tournamentId=${tournamentId}`).then(res => res.data.data),
  // PUT /api/matches/:id/score
  updateScore: (matchId: string, homeScore: number, awayScore: number) =>
    api.put<Match>(`/matches/${matchId}/score`, { homeScore, awayScore }).then(res => res.data.data),
  // PATCH /api/matches/:id/confirm
  confirm: (matchId: string) =>
    api.patch<Match>(`/matches/${matchId}/confirm`).then(res => res.data.data),
  // POST /api/schedule/generate
  generateSchedule: (data: { tournamentId: string; startDate: string; daysBetweenRounds: number }) =>
    api.post('/schedule/generate', data).then(res => res.data.data),
};

export const standingApi = {
  // GET /api/standings?tournamentId=...
  getByTournament: (tournamentId: string) =>
    api.get<Standing[]>(`/standings?tournamentId=${tournamentId}`).then(res => res.data.data),
  // POST /api/standings/calculate
  calculate: (tournamentId: string) =>
    api.post('/standings/calculate', { tournamentId }).then(res => res.data.data),
};

export const authApi = {
  // POST /api/auth/login
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; name?: string; role: string } }>('/auth/login', { email, password })
      .then(res => res.data),
  // POST /api/auth/register
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }).then(res => res.data),
};
// football_tournament_system/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === API ROUTES ===
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/tournaments', require('./modules/tournaments/tournament.routes'));
app.use('/api/teams', require('./modules/teams/team.routes'));
app.use('/api/matches', require('./modules/matches/match.routes'));
app.use('/api/standings', require('./modules/standings/standings.routes'));
app.use('/api/match-events', require('./modules/match-events/match-event.routes'));
app.use('/api/schedule', require('./modules/schedule/schedule.routes'));
app.use('/api/reports', require('./modules/reports/report.routes'));

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
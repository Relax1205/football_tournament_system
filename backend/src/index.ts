import cors from 'cors';
import express from 'express';
import { prisma } from './common/prisma';
import { config } from './config';
import applicationRoutes = require('./modules/applications/application.routes');
import authRoutes = require('./modules/auth/auth.routes');
import matchEventRoutes = require('./modules/match-events/match-event.routes');
import matchRoutes = require('./modules/matches/match.routes');
import playerRoutes = require('./modules/players/player.routes');
import notificationRoutes = require('./modules/notifications/notification.routes');
import reportRoutes = require('./modules/reports/report.routes');
import scheduleRoutes = require('./modules/schedule/schedule.routes');
import standingsRoutes = require('./modules/standings/standings.routes');
import teamRoutes = require('./modules/teams/team.routes');
import tournamentRoutes = require('./modules/tournaments/tournament.routes');
import userRoutes = require('./modules/users/user.routes');

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/match-events', matchEventRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/reports', reportRoutes);

app.use('*', (_request, response) => {
  response.status(404).json({ success: false, error: 'Endpoint not found' });
});

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log(`PostgreSQL connected: ${config.databaseTarget}`);

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to PostgreSQL.');
    console.error(`Configured target: ${config.databaseTarget}`);
    console.error('Use backend/.env DATABASE_URL or set DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD for local PostgreSQL.');

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
}

void bootstrap();

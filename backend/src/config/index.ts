import { resolvedDatabaseTarget } from './load-env';
import './load-env';

// football_tournament_system/backend/src/config/index.ts
export const config = {
  port: process.env.PORT || '4000',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseTarget: resolvedDatabaseTarget,
  nodeEnv: process.env.NODE_ENV || 'development',
};

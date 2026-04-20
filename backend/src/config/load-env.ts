import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const backendRoot = path.resolve(__dirname, '../..');
const envPath = path.join(backendRoot, '.env');
const envExamplePath = path.join(backendRoot, '.env.example');

const primaryResult = dotenv.config({ path: envPath });

if (primaryResult.error && !fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
}

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function hasDatabasePartsOverride() {
  const keys = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_SCHEMA',
    'PGHOST',
    'PGPORT',
    'PGDATABASE',
    'PGUSER',
    'PGPASSWORD',
  ];

  return keys.some((key) => {
    const value = process.env[key];
    return value !== undefined && value.trim() !== '';
  });
}

function buildDatabaseUrlFromParts() {
  if (!hasDatabasePartsOverride()) {
    return null;
  }

  const host = readEnvValue('DB_HOST', 'PGHOST') ?? 'localhost';
  const port = readEnvValue('DB_PORT', 'PGPORT') ?? '5432';
  const database = readEnvValue('DB_NAME', 'PGDATABASE') ?? 'football_tournament_db';
  const user = readEnvValue('DB_USER', 'PGUSER') ?? 'postgres';
  const password = readEnvValue('DB_PASSWORD', 'PGPASSWORD');
  const schema = readEnvValue('DB_SCHEMA') ?? 'public';
  const credentials = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);

  return `postgresql://${credentials}@${host}:${port}/${encodeURIComponent(database)}?schema=${encodeURIComponent(schema)}`;
}

function describeDatabaseTarget(url: string) {
  try {
    const parsed = new URL(url);
    const user = parsed.username ? decodeURIComponent(parsed.username) : 'default-user';
    const database = decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'default-db';
    const port = parsed.port || '5432';
    const schema = parsed.searchParams.get('schema') ?? 'public';

    return `${user}@${parsed.hostname}:${port}/${database}?schema=${schema}`;
  } catch {
    return 'configured DATABASE_URL';
  }
}

const derivedDatabaseUrl = buildDatabaseUrlFromParts();
if (derivedDatabaseUrl) {
  process.env.DATABASE_URL = derivedDatabaseUrl;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    [
      'DATABASE_URL is not configured.',
      'Create backend/.env with DATABASE_URL or set DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.',
      'Example: DATABASE_URL=postgresql://postgres:your-password@localhost:5432/football_tournament_db?schema=public',
    ].join(' '),
  );
}

export const resolvedDatabaseUrl = process.env.DATABASE_URL;
export const resolvedDatabaseTarget = describeDatabaseTarget(resolvedDatabaseUrl);

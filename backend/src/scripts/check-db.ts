import { prisma } from '../common/prisma';
import { config } from '../config';

async function main() {
  try {
    await prisma.$connect();
    console.log(`PostgreSQL connection OK: ${config.databaseTarget}`);
  } catch (error) {
    console.error('PostgreSQL connection failed.');
    console.error(`Configured target: ${config.databaseTarget}`);
    console.error('Set DATABASE_URL or local DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD values in backend/.env.');

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();

import path from 'node:path';
import { rm } from 'node:fs/promises';
import runner from 'node-pg-migrate';
import { Client } from 'pg';

/** Applies migrations to the test database once before the whole run. */
export default async function setup(): Promise<void> {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/wishlist_test';

  await rm(path.resolve(__dirname, '../../var/test-uploads'), { recursive: true, force: true });

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
  } catch (err) {
    throw new Error(
      `Cannot reach the test database at ${databaseUrl.replace(/:\/\/[^@]*@/, '://***@')}. ` +
        `Start PostgreSQL and create the database, or set TEST_DATABASE_URL. Cause: ${(err as Error).message}`,
    );
  }

  await runner({
    dbClient: client,
    migrationsTable: 'pgmigrations',
    dir: path.resolve(__dirname, '../../src/db/migrations'),
    direction: 'up',
    count: Infinity,
    log: () => undefined,
  });

  await client.end();
}

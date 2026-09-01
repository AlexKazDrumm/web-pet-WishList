import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Load a `.env` for local development. In Docker / CI the environment is passed
 * directly, so a missing file is fine. The monorepo keeps a single `.env` at
 * its root; this also handles being run from the backend workspace directory.
 */
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const file of candidates) {
  if (existsSync(file)) {
    dotenv.config({ path: file, quiet: true });
    break;
  }
}

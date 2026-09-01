import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

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

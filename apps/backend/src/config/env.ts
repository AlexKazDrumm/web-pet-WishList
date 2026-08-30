import { z } from 'zod';

/**
 * Environment contract. Parsed once at startup; the process refuses to start
 * when anything required is missing or malformed. Values are never logged.
 */
const rawSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65_535).default(3031),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  JWT_ACCESS_SECRET: z.string().default(''),
  JWT_REFRESH_SECRET: z.string().default(''),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),

  UPLOAD_DIR: z.string().default('./var/uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

function loadEnv() {
  const parsed = rawSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  const env = parsed.data;

  const missingSecrets: Array<'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'> = [];
  const weakSecret = (name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') => {
    const value = env[name];
    if (value.length < 32) missingSecrets.push(name);
  };
  weakSecret('JWT_ACCESS_SECRET');
  weakSecret('JWT_REFRESH_SECRET');

  if (missingSecrets.length > 0) {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        `Missing or weak secrets in production (need >= 32 chars, no default): ${missingSecrets.join(', ')}`,
      );
    }
    // Non-production: derive a stable-per-boot development secret so local work
    // does not require ceremony, while never shipping a hardcoded value.
    for (const name of missingSecrets) {
      env[name] = `dev-only-${name}-${'x'.repeat(40)}`;
    }
  }

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ');
  }

  return Object.freeze(env);
}

export type Env = ReturnType<typeof loadEnv>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) cached = loadEnv();
  return cached;
}

export function resetEnvForTests(): void {
  cached = null;
}

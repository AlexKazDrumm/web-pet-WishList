import cors, { type CorsOptions } from 'cors';
import express, { type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { getEnv } from '../config/env';
import { HttpError } from '../lib/http-error';

const env = getEnv();

/** Strict origin allowlist. No wildcards; non-browser callers (no Origin) pass. */
export function corsMiddleware(): RequestHandler {
  const allowlist = new Set(env.CORS_ORIGINS);
  const options: CorsOptions = {
    origin(origin, callback) {
      if (!origin || allowlist.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, 'forbidden', 'Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  };
  return cors(options);
}

export function helmetMiddleware(): RequestHandler {
  return helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'script-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
      },
    },
  });
}

/** JSON / urlencoded body parsers with a hard size cap. */
export const jsonBody: RequestHandler = express.json({ limit: '256kb' });
export const urlencodedBody: RequestHandler = express.urlencoded({ extended: false, limit: '256kb' });

const rateLimitHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(429, 'rate_limited', 'Too many requests, slow down'));
};

/** Baseline limiter for the whole API. */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 10_000 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Tighter limiter for credential endpoints. */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 10_000 : 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Limiter for the upload endpoint. */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 10_000 : 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

import { createHash, randomBytes } from 'node:crypto';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { getEnv } from '../../config/env';
import { HttpError } from '../../lib/http-error';

const env = getEnv();

export interface AccessClaims {
  sub: string;
  email: string;
}

export function signAccessToken(claims: AccessClaims): { token: string; expiresIn: number } {
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'] };
  const token = jwt.sign(claims, env.JWT_ACCESS_SECRET, options);
  const decoded = jwt.decode(token) as JwtPayload;
  const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;
  return { token, expiresIn };
}

export function verifyAccessToken(token: string): AccessClaims {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw HttpError.unauthorized('Malformed token');
    }
    return { sub: payload.sub, email: payload.email };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw HttpError.unauthorized('Invalid or expired token');
  }
}

/** Opaque refresh token. A JWT wrapper carries expiry; the DB stores only its hash. */
export function createRefreshToken(sub: string): { token: string; hash: string; expiresAt: Date } {
  const jti = randomBytes(32).toString('base64url');
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_TTL as SignOptions['expiresIn'] };
  const token = jwt.sign({ sub, jti }, env.JWT_REFRESH_SECRET, options);
  const decoded = jwt.decode(token) as JwtPayload;
  const expiresAt = new Date((decoded.exp ?? 0) * 1000);
  return { token, hash: hashToken(token), expiresAt };
}

export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    if (typeof payload.sub !== 'string') throw HttpError.unauthorized('Malformed refresh token');
    return { sub: payload.sub };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw HttpError.unauthorized('Invalid or expired refresh token');
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

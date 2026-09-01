import bcrypt from 'bcryptjs';
import type { User } from '@wishlist/shared';
import { HttpError } from '../../lib/http-error';
import * as repo from './auth.repo';
import {
  createRefreshToken,
  hashToken,
  signAccessToken,
  verifyRefreshToken,
} from './tokens';
import type { LoginInput, RegisterInput } from './auth.schemas';

const BCRYPT_ROUNDS = 12;

function toUser(row: repo.UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at.toISOString(),
  };
}

async function issueSession(row: repo.UserRow) {
  const access = signAccessToken({ sub: row.id, email: row.email });
  const refresh = createRefreshToken(row.id);
  await repo.storeRefreshToken({ userId: row.id, tokenHash: refresh.hash, expiresAt: refresh.expiresAt });
  return {
    user: toUser(row),
    tokens: {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresIn: access.expiresIn,
    },
  };
}

export async function register(input: RegisterInput) {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) throw HttpError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  let row: repo.UserRow;
  try {
    row = await repo.insertUser({
      email: input.email,
      passwordHash,
      displayName: input.displayName ?? null,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw HttpError.conflict('An account with this email already exists');
    }
    throw err;
  }
  return issueSession(row);
}

export async function login(input: LoginInput) {
  const row = await repo.findUserByEmail(input.email);
  // Compare against a dummy hash when the user is missing to blunt timing probes.
  const hash = row?.password_hash ?? '$2a$12$0000000000000000000000000000000000000000000000000000o';
  const ok = await bcrypt.compare(input.password, hash);
  if (!row || !ok) throw HttpError.unauthorized('Invalid email or password');
  return issueSession(row);
}

export async function refresh(refreshToken: string) {
  const { sub } = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const active = await repo.consumeActiveRefreshToken(tokenHash);
  if (!active || active.user_id !== sub) {
    throw HttpError.unauthorized('Refresh token is no longer valid');
  }
  const row = await repo.findUserById(sub);
  if (!row) throw HttpError.unauthorized('Account not found');

  return issueSession(row);
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    return;
  }
  await repo.revokeRefreshToken(hashToken(refreshToken));
}

export async function getProfile(userId: string): Promise<User> {
  const row = await repo.findUserById(userId);
  if (!row) throw HttpError.unauthorized('Account not found');
  return toUser(row);
}

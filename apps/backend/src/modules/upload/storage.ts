import { createReadStream } from 'node:fs';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getEnv } from '../../config/env';
import { logger } from '../../lib/logger';

const env = getEnv();

export const uploadRoot = path.resolve(env.UPLOAD_DIR);

export async function ensureUploadRoot(): Promise<void> {
  await mkdir(uploadRoot, { recursive: true });
}

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}\.(jpg|jpeg|png|webp|pdf)$/;

/** Returns a validated path inside `uploadRoot`. */
export function resolveStoredPath(id: string): string | null {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
  if (id.includes('..') || id.includes('/') || id.includes('\\') || id.includes('\0')) return null;
  const resolved = path.resolve(uploadRoot, id);
  if (resolved !== path.join(uploadRoot, id)) return null;
  if (!resolved.startsWith(uploadRoot + path.sep)) return null;
  return resolved;
}

export async function persistBuffer(buffer: Buffer, filename: string): Promise<void> {
  await ensureUploadRoot();
  const target = path.join(uploadRoot, filename);
  if (!target.startsWith(uploadRoot + path.sep)) throw new Error('refusing to write outside upload root');
  await writeFile(target, buffer, { flag: 'wx' });
}

export async function statStored(id: string): Promise<{ path: string; size: number } | null> {
  const resolved = resolveStoredPath(id);
  if (!resolved) return null;
  try {
    const info = await stat(resolved);
    if (!info.isFile()) return null;
    return { path: resolved, size: info.size };
  } catch {
    return null;
  }
}

export function openStored(absPath: string) {
  return createReadStream(absPath);
}

export async function removeQuietly(absPath: string | undefined): Promise<void> {
  if (!absPath) return;
  try {
    await unlink(absPath);
  } catch (err) {
    logger.warn({ err, absPath }, 'failed to remove temp file');
  }
}

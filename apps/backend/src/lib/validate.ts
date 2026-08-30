import type { ZodTypeAny, z } from 'zod';
import { HttpError } from './http-error';

/** Parse `data` with `schema`, converting a Zod failure into a 400 HttpError. */
export function parseOrThrow<TSchema extends ZodTypeAny>(schema: TSchema, data: unknown): z.infer<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw HttpError.badRequest('Request validation failed', details);
  }
  return result.data;
}

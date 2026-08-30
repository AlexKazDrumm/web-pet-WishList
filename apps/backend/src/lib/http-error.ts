import { ERROR_CODES, type ErrorCode } from '@wishlist/shared';

/** An error whose shape is safe to send to clients. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new HttpError(400, ERROR_CODES.VALIDATION, message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new HttpError(401, ERROR_CODES.UNAUTHORIZED, message);
  }
  static forbidden(message = 'Not allowed') {
    return new HttpError(403, ERROR_CODES.FORBIDDEN, message);
  }
  static notFound(message = 'Not found') {
    return new HttpError(404, ERROR_CODES.NOT_FOUND, message);
  }
  static conflict(message = 'Already exists') {
    return new HttpError(409, ERROR_CODES.CONFLICT, message);
  }
  static payloadTooLarge(message = 'Payload too large') {
    return new HttpError(413, ERROR_CODES.PAYLOAD_TOO_LARGE, message);
  }
  static unsupportedMedia(message = 'Unsupported media type') {
    return new HttpError(415, ERROR_CODES.UNSUPPORTED_MEDIA, message);
  }
}

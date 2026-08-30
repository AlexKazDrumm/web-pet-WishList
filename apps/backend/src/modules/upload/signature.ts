/**
 * Content-sniffing for the four accepted media types. The declared mime type
 * from the client is never trusted; the file's own leading bytes decide.
 */

export type SniffedMime = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  bytes.every((b, i) => buf[offset + i] === b);

export function sniffMime(buf: Buffer): SniffedMime | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'image/jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';

  // WEBP: "RIFF" .... "WEBP"
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }

  // PDF: "%PDF-"
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';

  return null;
}

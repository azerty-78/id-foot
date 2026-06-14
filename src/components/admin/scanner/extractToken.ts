const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function extractToken(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const qrMatch = url.pathname.match(/\/api\/qr\/([^/]+)/i);
    if (qrMatch?.[1]) return qrMatch[1];
  } catch {
    if (UUID_REGEX.test(trimmed)) return trimmed;
  }

  return null;
}

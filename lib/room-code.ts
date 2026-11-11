const LEGACY_ROOM_CODE_RE = /^[a-z2-9]{3}-[a-z2-9]{3}-[a-z2-9]{3}$/;
const ROOM_NAME_RE = /^(?!.*--)[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/;
const COMPACT_ROOM_CODE_RE = /^[a-z2-9]{9}$/;
const RESERVED_ROOM_NAMES = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "desktop",
  "join",
  "login",
  "logout",
  "new",
  "settings",
  "sign-in",
  "sign-up",
  "support",
]);

export function formatRoomCode(raw: string): string {
  const clean = raw.toLowerCase().replace(/[^a-z2-9]/g, "").slice(0, 9);
  return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 9)]
    .filter(Boolean)
    .join("-");
}

/** Turn a human room name into the URL-safe slug stored in the database. */
export function slugifyRoomName(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/**
 * Accept a room name, legacy code, `kali/name`, or a pasted meeting URL and
 * return the identifier used in `/m/[roomCode]`.
 */
export function normalizeRoomId(raw: string): string {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+\/m\//, "")
    .replace(/^\/?m\//, "")
    .replace(/^kali\//, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");

  if (LEGACY_ROOM_CODE_RE.test(value)) return value;
  if (COMPACT_ROOM_CODE_RE.test(value)) return formatRoomCode(value);
  return slugifyRoomName(value);
}

export function isRoomId(value: string): boolean {
  return (
    LEGACY_ROOM_CODE_RE.test(value) ||
    (ROOM_NAME_RE.test(value) && !RESERVED_ROOM_NAMES.has(value))
  );
}

/** Compact codes are read as legacy codes, so custom names should include a dash. */
export function looksLikeCompactRoomCode(value: string): boolean {
  return COMPACT_ROOM_CODE_RE.test(value);
}

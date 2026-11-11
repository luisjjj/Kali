const ROOM_CODE_RE = /^[a-z2-9]{3}-[a-z2-9]{3}-[a-z2-9]{3}$/;

export function formatRoomCode(raw: string): string {
  const clean = raw.toLowerCase().replace(/[^a-z2-9]/g, "").slice(0, 9);
  return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 9)]
    .filter(Boolean)
    .join("-");
}

export function isRoomCode(value: string): boolean {
  return ROOM_CODE_RE.test(value.trim());
}

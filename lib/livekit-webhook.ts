import { CALL_LIMIT_MS } from "./limits";

export type ParticipantMetadata = {
  isHost: boolean;
  displayName?: string;
};

export function parseParticipantMetadata(raw: string | null | undefined): ParticipantMetadata {
  if (!raw) return { isHost: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { isHost: false };

    const value = parsed as Record<string, unknown>;
    const displayName =
      typeof value.displayName === "string" && value.displayName.trim()
        ? value.displayName.trim()
        : undefined;

    return { isHost: value.isHost === true, displayName };
  } catch {
    // Malformed metadata should not block a join. The identity is still trusted.
    return { isHost: false };
  }
}

export function roleFromMetadata(raw: string | null | undefined): "host" | "guest" {
  return parseParticipantMetadata(raw).isHost ? "host" : "guest";
}

export function userIdFromIdentity(identity: string): string | null {
  const prefix = "user-";
  return identity.startsWith(prefix) ? identity.slice(prefix.length) : null;
}

export function dateFromLiveKitMs(
  value: bigint | number | null | undefined,
  fallback: Date = new Date()
): Date {
  if (value === null || value === undefined) return fallback;
  const milliseconds = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return fallback;
  return new Date(milliseconds);
}

export function dateFromLiveKitSeconds(
  value: bigint | number | null | undefined,
  fallback: Date = new Date()
): Date {
  if (value === null || value === undefined) return fallback;
  const seconds = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(seconds) || seconds <= 0) return fallback;
  return new Date(seconds * 1000);
}

export function deadlineFromStart(startedAt: Date): Date {
  return new Date(startedAt.getTime() + CALL_LIMIT_MS);
}

export function participantMinutes(
  joinedAt: Date,
  leftAt: Date | null,
  fallbackEnd: Date
): number {
  const end = leftAt ?? fallbackEnd;
  return Math.max(0, Math.floor((end.getTime() - joinedAt.getTime()) / 60_000));
}

export function minutesByParticipant(
  rows: Array<{
    id: string;
    identity: string | null;
    joinedAt: Date;
    leftAt: Date | null;
  }>,
  endedAt: Date
): Record<string, number> {
  return Object.fromEntries(
    rows.map((row) => [
      row.identity ?? row.id,
      participantMinutes(row.joinedAt, row.leftAt, endedAt),
    ])
  );
}

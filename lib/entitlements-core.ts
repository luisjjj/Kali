export type ResolvedEntitlements = {
  maxParticipants: number;
  maxDurationMinutes: number;
  recordingMinutes: number;
  transcriptMinutes: number;
  retentionDays: number;
  customDomains: boolean;
  apiParticipantMinutes: number;
  seats: number;
};

export type EntitlementRow = {
  key: string;
  value: unknown;
  expiresAt: Date | null;
};

// Free is the only active plan in Phase 1. The catalog rows for paid plans
// stay dormant until billing exists; overrides can raise limits for support,
// trials, or a future subscription without a code change.
export const FREE_ENTITLEMENTS: ResolvedEntitlements = {
  maxParticipants: 8,
  maxDurationMinutes: 60,
  recordingMinutes: 0,
  transcriptMinutes: 0,
  retentionDays: 7,
  customDomains: false,
  apiParticipantMinutes: 0,
  seats: 1,
};

const NUMERIC_KEYS = [
  "maxParticipants",
  "maxDurationMinutes",
  "recordingMinutes",
  "transcriptMinutes",
  "retentionDays",
  "apiParticipantMinutes",
  "seats",
] as const;

type NumericKey = (typeof NUMERIC_KEYS)[number];

const NUMERIC_LIMITS = {
  maxParticipants: { min: 1, max: 1000 },
  maxDurationMinutes: { min: 1, max: 1440 },
  recordingMinutes: { min: 0, max: 1_000_000 },
  transcriptMinutes: { min: 0, max: 1_000_000 },
  retentionDays: { min: 0, max: 3650 },
  apiParticipantMinutes: { min: 0, max: 1_000_000 },
  seats: { min: 1, max: 1000 },
} satisfies Record<NumericKey, { min: number; max: number }>;

function numericValue(value: unknown, min: number, max: number): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export function resolveEntitlementsFromRows(
  rows: EntitlementRow[],
  now: Date = new Date()
): ResolvedEntitlements {
  const resolved: ResolvedEntitlements = { ...FREE_ENTITLEMENTS };

  for (const row of rows) {
    if (row.expiresAt && row.expiresAt.getTime() <= now.getTime()) continue;

    if (row.key === "customDomains") {
      if (typeof row.value === "boolean") {
        resolved.customDomains = row.value;
      }
      continue;
    }

    if (!NUMERIC_KEYS.includes(row.key as NumericKey)) continue;

    const key = row.key as NumericKey;
    const value = numericValue(row.value, NUMERIC_LIMITS[key].min, NUMERIC_LIMITS[key].max);
    if (value !== null) {
      resolved[key] = value;
    }
  }

  return resolved;
}

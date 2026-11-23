// Call recaps are rendered on the server, so times are pinned to one
// timezone to keep markup deterministic and avoid hydration mismatches.
const RECAP_TIME_ZONE = "Africa/Lagos";

export function callDurationMs(startedAt: Date | null, endedAt: Date | null): number | null {
  if (!startedAt || !endedAt) return null;
  const ms = endedAt.getTime() - startedAt.getTime();
  return ms > 0 ? ms : null;
}

export function formatCallDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "Under a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function formatRecapDate(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: RECAP_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRecapTime(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: RECAP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

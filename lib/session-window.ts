export type SessionWindowInput = {
  startedAt: Date | null;
  deadlineAt: Date | null;
};

export type SessionWindow = {
  startedAt: Date;
  endsAt: Date;
  needsUpdate: boolean;
};

export function resolveSessionWindow(
  input: SessionWindowInput,
  now: Date,
  limitMs: number
): SessionWindow {
  const startedAt =
    input.startedAt ??
    (input.deadlineAt
      ? new Date(input.deadlineAt.getTime() - limitMs)
      : now);
  const endsAt =
    input.deadlineAt ?? new Date(startedAt.getTime() + limitMs);

  return {
    startedAt,
    endsAt,
    needsUpdate: !input.startedAt || !input.deadlineAt,
  };
}

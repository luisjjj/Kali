import assert from "node:assert/strict";
import test from "node:test";
import { resolveSessionWindow } from "../lib/session-window";

const NOW = new Date("2026-01-01T00:00:00.000Z");
const LIMIT_MS = 60 * 60 * 1000;

test("a new session opens the clock at the current time", () => {
  const window = resolveSessionWindow({ startedAt: null, deadlineAt: null }, NOW, LIMIT_MS);

  assert.equal(window.startedAt.toISOString(), "2026-01-01T00:00:00.000Z");
  assert.equal(window.endsAt.toISOString(), "2026-01-01T01:00:00.000Z");
  assert.equal(window.needsUpdate, true);
});

test("a complete session keeps its original window", () => {
  const startedAt = new Date("2025-12-31T23:30:00.000Z");
  const deadlineAt = new Date("2026-01-01T00:30:00.000Z");
  const window = resolveSessionWindow({ startedAt, deadlineAt }, NOW, LIMIT_MS);

  assert.equal(window.startedAt, startedAt);
  assert.equal(window.endsAt, deadlineAt);
  assert.equal(window.needsUpdate, false);
});

test("a partial session is repaired from the known side", () => {
  const startedAt = new Date("2025-12-31T23:30:00.000Z");
  const deadlineAt = new Date("2026-01-01T00:30:00.000Z");

  const fromStart = resolveSessionWindow({ startedAt, deadlineAt: null }, NOW, LIMIT_MS);
  assert.equal(fromStart.endsAt.toISOString(), "2026-01-01T00:30:00.000Z");
  assert.equal(fromStart.needsUpdate, true);

  const fromDeadline = resolveSessionWindow({ startedAt: null, deadlineAt }, NOW, LIMIT_MS);
  assert.equal(fromDeadline.startedAt.toISOString(), "2025-12-31T23:30:00.000Z");
  assert.equal(fromDeadline.needsUpdate, true);
});

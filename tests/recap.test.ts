import assert from "node:assert/strict";
import test from "node:test";
import { callDurationMs, formatCallDuration } from "../lib/recap";

test("duration is measured between session start and end", () => {
  const start = new Date("2026-01-01T10:00:00.000Z");
  const end = new Date("2026-01-01T10:42:00.000Z");

  assert.equal(callDurationMs(start, end), 42 * 60 * 1000);
});

test("duration falls back to null when either edge is missing or inverted", () => {
  const start = new Date("2026-01-01T10:00:00.000Z");

  assert.equal(callDurationMs(null, start), null);
  assert.equal(callDurationMs(start, null), null);
  assert.equal(callDurationMs(start, new Date("2026-01-01T09:00:00.000Z")), null);
});

test("durations read like a person wrote them", () => {
  assert.equal(formatCallDuration(30 * 1000), "Under a minute");
  assert.equal(formatCallDuration(42 * 60 * 1000), "42 min");
  assert.equal(formatCallDuration(60 * 60 * 1000), "1 hr");
  assert.equal(formatCallDuration((60 + 17) * 60 * 1000), "1 hr 17 min");
});

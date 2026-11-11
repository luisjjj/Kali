import assert from "node:assert/strict";
import test from "node:test";
import {
  FREE_ENTITLEMENTS,
  resolveEntitlementsFromRows,
} from "../lib/entitlements-core";

test("entitlements default to the free plan", () => {
  assert.deepEqual(resolveEntitlementsFromRows([]), FREE_ENTITLEMENTS);
});

test("entitlement overrides accept valid values and clamp the rest", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const resolved = resolveEntitlementsFromRows(
    [
      { key: "maxParticipants", value: 25, expiresAt: null },
      { key: "maxDurationMinutes", value: "120", expiresAt: null },
      { key: "maxParticipants", value: 0, expiresAt: null },
      { key: "retentionDays", value: -10, expiresAt: null },
      { key: "seats", value: 0, expiresAt: null },
      { key: "recordingMinutes", value: 3, expiresAt: new Date("2020-01-01") },
      { key: "transcriptMinutes", value: "not a number", expiresAt: null },
      { key: "customDomains", value: true, expiresAt: null },
      { key: "unknownKey", value: 999, expiresAt: null },
    ],
    now
  );

  assert.equal(resolved.maxParticipants, 1);
  assert.equal(resolved.maxDurationMinutes, 120);
  assert.equal(resolved.retentionDays, 0);
  assert.equal(resolved.seats, 1);
  assert.equal(resolved.recordingMinutes, 0);
  assert.equal(resolved.transcriptMinutes, 0);
  assert.equal(resolved.customDomains, true);
});

test("expired and malformed overrides do not change defaults", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const resolved = resolveEntitlementsFromRows(
    [
      { key: "maxParticipants", value: 25, expiresAt: new Date("2026-01-01T00:00:00.000Z") },
      { key: "customDomains", value: "true", expiresAt: null },
      { key: "maxDurationMinutes", value: Number.POSITIVE_INFINITY, expiresAt: null },
    ],
    now
  );

  assert.deepEqual(resolved, FREE_ENTITLEMENTS);
});

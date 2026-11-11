import assert from "node:assert/strict";
import test from "node:test";
import {
  dateFromLiveKitMs,
  dateFromLiveKitSeconds,
  deadlineFromStart,
  minutesByParticipant,
  parseParticipantMetadata,
  participantMinutes,
  roleFromMetadata,
  userIdFromIdentity,
} from "../lib/livekit-webhook";
import { CALL_LIMIT_MS } from "../lib/limits";

test("participant metadata is parsed defensively", () => {
  assert.deepEqual(parseParticipantMetadata('{"isHost":true,"displayName":" Ada "}'), {
    isHost: true,
    displayName: "Ada",
  });
  assert.deepEqual(parseParticipantMetadata('{"isHost":false}'), {
    isHost: false,
    displayName: undefined,
  });
  assert.deepEqual(parseParticipantMetadata("not json"), { isHost: false });
  assert.deepEqual(parseParticipantMetadata(""), { isHost: false });
  assert.equal(roleFromMetadata('{"isHost":true}'), "host");
  assert.equal(roleFromMetadata(null), "guest");
});

test("participant identity maps authenticated users to their user id", () => {
  assert.equal(userIdFromIdentity("user-abc-123"), "abc-123");
  assert.equal(userIdFromIdentity("guest-12345678"), null);
});

test("LiveKit timestamps fall back when missing or invalid", () => {
  const fallback = new Date("2026-01-01T00:00:00.000Z");

  assert.equal(dateFromLiveKitMs(BigInt(1_700_000_000_000), fallback).toISOString(), "2023-11-14T22:13:20.000Z");
  assert.equal(dateFromLiveKitSeconds(BigInt(1_700_000_000), fallback).toISOString(), "2023-11-14T22:13:20.000Z");
  assert.equal(dateFromLiveKitMs(null, fallback), fallback);
  assert.equal(dateFromLiveKitMs(BigInt(0), fallback), fallback);
  assert.equal(dateFromLiveKitSeconds(0, fallback), fallback);
});

test("deadline and participant minutes use the 60 minute cap", () => {
  const start = new Date("2026-01-01T00:00:00.000Z");
  assert.equal(deadlineFromStart(start).getTime(), start.getTime() + CALL_LIMIT_MS);

  assert.equal(participantMinutes(start, new Date("2026-01-01T00:05:30.000Z"), start), 5);
  assert.equal(participantMinutes(start, null, new Date("2026-01-01T00:03:20.000Z")), 3);
  assert.equal(participantMinutes(start, new Date("2025-12-31T23:59:00.000Z"), start), 0);
});

test("minutes by participant keys by identity and falls back to the row id", () => {
  const endedAt = new Date("2026-01-01T00:10:00.000Z");
  const minutes = minutesByParticipant(
    [
      {
        id: "row-1",
        identity: "user-1",
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        leftAt: new Date("2026-01-01T00:06:30.000Z"),
      },
      {
        id: "row-2",
        identity: null,
        joinedAt: new Date("2026-01-01T00:02:00.000Z"),
        leftAt: null,
      },
    ],
    endedAt
  );

  assert.deepEqual(minutes, { "user-1": 6, "row-2": 8 });
});

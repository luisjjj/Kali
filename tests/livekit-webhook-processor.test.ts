import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../lib/db/schema";
import {
  processLiveKitEvent,
  type WebhookDb,
  type LiveKitWebhookEvent,
} from "../lib/livekit-webhook-processor";
import { applyAllMigrations } from "./helpers/migrations";

const ROOM_STARTED = Date.parse("2026-01-01T00:00:00.000Z");
const GUEST_JOINED = Date.parse("2026-01-01T00:01:00.000Z");
const GUEST_LEFT = Date.parse("2026-01-01T00:06:00.000Z");
const ROOM_FINISHED = Date.parse("2026-01-01T00:10:00.000Z");

function seconds(milliseconds: number) {
  return BigInt(Math.floor(milliseconds / 1000));
}

test("webhook processor tracks sessions and writes idempotent usage", async () => {
  const client = new PGlite();
  await client.waitReady;

  try {
    await applyAllMigrations(client);
    const db = drizzle(client, { schema }) as unknown as WebhookDb;

    const [meeting] = await db
      .insert(schema.meetings)
      .values({
        hostUserId: "host-1",
        title: "Test call",
        roomCode: "abc-def-ghi",
      })
      .returning();

    const room = {
      name: meeting.roomCode,
      creationTimeMs: BigInt(ROOM_STARTED),
      numParticipants: 1,
    };

    await processLiveKitEvent(db, {
      id: "evt-room-started",
      event: "room_started",
      createdAt: seconds(ROOM_STARTED),
      room,
    });

    await processLiveKitEvent(db, {
      id: "evt-host-joined",
      event: "participant_joined",
      createdAt: seconds(ROOM_STARTED),
      room,
      participant: {
        identity: "user-host-1",
        name: "Host",
        metadata: JSON.stringify({ isHost: true }),
        joinedAtMs: BigInt(ROOM_STARTED),
      },
    });

    await processLiveKitEvent(db, {
      id: "evt-guest-joined",
      event: "participant_joined",
      createdAt: seconds(GUEST_JOINED),
      room: { ...room, numParticipants: 2 },
      participant: {
        identity: "guest-1234",
        name: "Guest",
        metadata: JSON.stringify({ isHost: false }),
        joinedAtMs: BigInt(GUEST_JOINED),
      },
    });

    await processLiveKitEvent(db, {
      id: "evt-guest-left",
      event: "participant_left",
      createdAt: seconds(GUEST_LEFT),
      room: { ...room, numParticipants: 1 },
      participant: {
        identity: "guest-1234",
        name: "Guest",
        metadata: JSON.stringify({ isHost: false }),
        joinedAtMs: BigInt(GUEST_JOINED),
      },
    });

    const finished: LiveKitWebhookEvent = {
      id: "evt-room-finished",
      event: "room_finished",
      createdAt: seconds(ROOM_FINISHED),
      room: { ...room, numParticipants: 0 },
    };

    await processLiveKitEvent(db, finished);

    const [session] = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.meetingId, meeting.id));
    assert.equal(session.status, "ended");
    assert.equal(session.startedAt?.toISOString(), "2026-01-01T00:00:00.000Z");
    assert.equal(session.endedAt?.toISOString(), "2026-01-01T00:10:00.000Z");
    assert.equal(session.deadlineAt?.toISOString(), "2026-01-01T01:00:00.000Z");
    assert.equal(session.peakParticipants, 2);
    assert.deepEqual(session.minutesByParticipant, {
      "user-host-1": 10,
      "guest-1234": 5,
    });

    const people = await db
      .select()
      .from(schema.participants)
      .where(eq(schema.participants.meetingId, meeting.id));
    const host = people.find((person) => person.identity === "user-host-1");
    const guest = people.find((person) => person.identity === "guest-1234");
    assert.equal(host?.role, "host");
    assert.equal(host?.sessionId, session.id);
    assert.equal(host?.leftAt?.toISOString(), "2026-01-01T00:10:00.000Z");
    assert.equal(guest?.role, "guest");
    assert.equal(guest?.sessionId, session.id);
    assert.equal(guest?.leftAt?.toISOString(), "2026-01-01T00:06:00.000Z");

    const usage = await db
      .select()
      .from(schema.usageEvents)
      .where(eq(schema.usageEvents.sessionId, session.id));
    assert.equal(usage.length, 15);
    assert.equal(new Set(usage.map((event) => event.idempotencyKey)).size, 15);
    assert.ok(usage.every((event) => event.ownerUserId === "host-1"));
    assert.ok(usage.every((event) => event.kind === "participant_minute"));
    assert.ok(usage.every((event) => event.quantity === "1"));

    const [endedMeeting] = await db
      .select()
      .from(schema.meetings)
      .where(eq(schema.meetings.id, meeting.id));
    assert.equal(endedMeeting.endedAt?.toISOString(), "2026-01-01T00:10:00.000Z");

    // LiveKit retries on non-2xx. Replaying the same event must not double count.
    await processLiveKitEvent(db, finished);
    const replayedUsage = await db
      .select()
      .from(schema.usageEvents)
      .where(eq(schema.usageEvents.sessionId, session.id));
    assert.equal(replayedUsage.length, 15);
  } finally {
    await client.close();
  }
});

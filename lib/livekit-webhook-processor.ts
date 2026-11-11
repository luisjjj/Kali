import { and, eq, isNull, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  meetings,
  participants,
  sessions,
  usageEvents,
  type Meeting,
} from "./db/schema";
import type * as schema from "./db/schema";
import {
  dateFromLiveKitMs,
  dateFromLiveKitSeconds,
  deadlineFromStart,
  minutesByParticipant,
  parseParticipantMetadata,
  participantMinutes,
  userIdFromIdentity,
} from "./livekit-webhook";

export type WebhookDb = NeonHttpDatabase<typeof schema>;

export type LiveKitWebhookEvent = {
  id: string;
  event: string;
  createdAt: bigint | number;
  room?: {
    name: string;
    creationTimeMs?: bigint | number;
    numParticipants?: number;
  };
  participant?: {
    identity: string;
    name?: string;
    metadata?: string;
    joinedAtMs?: bigint | number;
  };
};

export async function processLiveKitEvent(
  db: WebhookDb,
  event: LiveKitWebhookEvent
) {
  const roomName = event.room?.name;
  if (!roomName) return;

  const [meeting] = await db.select().from(meetings).where(eq(meetings.roomCode, roomName));
  if (!meeting) return;

  // Meetings are terminal. Room finished still needs to close the session and
  // write usage after the host has already stamped ended_at.
  if (meeting.endedAt && event.event !== "room_finished") return;

  const now = new Date();

  switch (event.event) {
    case "room_started": {
      const startedAt = dateFromLiveKitMs(event.room?.creationTimeMs, now);
      await ensureSession(db, meeting, startedAt, true);
      return;
    }
    case "participant_joined": {
      if (!event.participant) return;
      await handleParticipantJoined(db, meeting, event, now);
      return;
    }
    case "participant_left":
    case "participant_connection_aborted": {
      if (!event.participant) return;
      await handleParticipantLeft(db, meeting, event, now);
      return;
    }
    case "room_finished": {
      await handleRoomFinished(db, meeting, event, now);
      return;
    }
    default:
      return;
  }
}

async function ensureSession(
  db: WebhookDb,
  meeting: Meeting,
  startedAt: Date,
  makeLive: boolean
) {
  const deadlineAt = deadlineFromStart(startedAt);

  const [session] = await db
    .insert(sessions)
    .values({
      meetingId: meeting.id,
      livekitRoomName: meeting.roomCode,
      status: "live",
      startedAt,
      deadlineAt,
    })
    .onConflictDoUpdate({
      target: sessions.meetingId,
      set: {
        livekitRoomName: meeting.roomCode,
        startedAt: sql`coalesce(${sessions.startedAt}, ${startedAt})`,
        deadlineAt: sql`coalesce(${sessions.deadlineAt}, ${deadlineAt})`,
        ...(makeLive
          ? { status: "live", endedAt: null, endReason: null }
          : {
              status: sql`case when ${sessions.status} = 'pending' then 'live' else ${sessions.status} end`,
            }),
      },
    })
    .returning();

  return session;
}

async function handleParticipantJoined(
  db: WebhookDb,
  meeting: Meeting,
  event: LiveKitWebhookEvent,
  now: Date
) {
  const participant = event.participant;
  if (!participant?.identity) return;

  const identity = participant.identity;
  const joinedAt = dateFromLiveKitMs(participant.joinedAtMs, now);
  const session = await ensureSession(db, meeting, joinedAt, false);
  const metadata = parseParticipantMetadata(participant.metadata);
  const role =
    identity === `user-${meeting.hostUserId}` || metadata.isHost ? "host" : "guest";
  const displayName = participant.name?.trim() || metadata.displayName || identity;

  await db
    .insert(participants)
    .values({
      meetingId: meeting.id,
      sessionId: session.id,
      identity,
      userId: userIdFromIdentity(identity),
      displayName,
      role,
      joinedAt,
      leftAt: null,
    })
    .onConflictDoUpdate({
      target: [participants.meetingId, participants.identity],
      set: {
        sessionId: session.id,
        userId: userIdFromIdentity(identity),
        displayName,
        role,
        leftAt: null,
      },
    });

  const peak = event.room?.numParticipants ?? 0;
  if (peak > 0) {
    await db
      .update(sessions)
      .set({ peakParticipants: sql`greatest(${sessions.peakParticipants}, ${peak})` })
      .where(eq(sessions.id, session.id));
  }
}

async function handleParticipantLeft(
  db: WebhookDb,
  meeting: Meeting,
  event: LiveKitWebhookEvent,
  now: Date
) {
  const participant = event.participant;
  if (!participant?.identity) return;

  const identity = participant.identity;
  const leftAt = dateFromLiveKitSeconds(event.createdAt, now);
  const joinedAt = dateFromLiveKitMs(participant.joinedAtMs, leftAt);
  const session = await ensureSession(db, meeting, joinedAt, false);
  const metadata = parseParticipantMetadata(participant.metadata);
  const role =
    identity === `user-${meeting.hostUserId}` || metadata.isHost ? "host" : "guest";
  const displayName = participant.name?.trim() || metadata.displayName || identity;

  await db
    .insert(participants)
    .values({
      meetingId: meeting.id,
      sessionId: session.id,
      identity,
      userId: userIdFromIdentity(identity),
      displayName,
      role,
      joinedAt,
      leftAt,
    })
    .onConflictDoUpdate({
      target: [participants.meetingId, participants.identity],
      set: { sessionId: session.id, leftAt },
    });
}

async function handleRoomFinished(
  db: WebhookDb,
  meeting: Meeting,
  event: LiveKitWebhookEvent,
  now: Date
) {
  const endedAt = dateFromLiveKitSeconds(event.createdAt, now);

  const [session] = await db
    .insert(sessions)
    .values({
      meetingId: meeting.id,
      livekitRoomName: meeting.roomCode,
      status: "ended",
      endedAt,
      endReason: "room_finished",
    })
    .onConflictDoUpdate({
      target: sessions.meetingId,
      set: {
        status: "ended",
        endedAt: sql`coalesce(${sessions.endedAt}, ${endedAt})`,
        endReason: "room_finished",
      },
    })
    .returning();

  await db
    .update(participants)
    .set({ leftAt: endedAt })
    .where(and(eq(participants.sessionId, session.id), isNull(participants.leftAt)));

  await db
    .update(meetings)
    .set({ endedAt })
    .where(and(eq(meetings.id, meeting.id), isNull(meetings.endedAt)));

  const rows = await db
    .select({
      id: participants.id,
      identity: participants.identity,
      joinedAt: participants.joinedAt,
      leftAt: participants.leftAt,
    })
    .from(participants)
    .where(eq(participants.sessionId, session.id));

  await db
    .update(sessions)
    .set({ minutesByParticipant: minutesByParticipant(rows, endedAt) })
    .where(eq(sessions.id, session.id));

  const usageRows = rows.flatMap((row) => {
    const minutes = participantMinutes(row.joinedAt, row.leftAt, endedAt);
    const participantKey = row.identity ?? row.id;

    return Array.from({ length: minutes }, (_, index) => ({
      ownerUserId: meeting.hostUserId,
      sessionId: session.id,
      kind: "participant_minute",
      quantity: "1",
      occurredAt: new Date(row.joinedAt.getTime() + (index + 1) * 60_000),
      idempotencyKey: `session:${session.id}:participant:${participantKey}:${index + 1}`,
    }));
  });

  if (usageRows.length > 0) {
    await db
      .insert(usageEvents)
      .values(usageRows)
      .onConflictDoNothing({ target: usageEvents.idempotencyKey });
  }
}

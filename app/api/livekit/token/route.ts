import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, count, eq, gt, isNull, ne, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings, participants, sessions } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { resolveEntitlements } from "@/lib/entitlements";
import { livekitEnv, signJoinToken } from "@/lib/livekit";
import { resolveSessionWindow } from "@/lib/session-window";
import { tokenRequestSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Guests allowed (display name in body). Host flag is derived server-side
// from meetings.host_user_id. Client claims are never trusted.
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const parsed = tokenRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { roomCode, displayName } = parsed.data;

  // Session check and meeting lookup are independent. Run together.
  const [meetingRows, { data: session }] = await Promise.all([
    db.select().from(meetings).where(eq(meetings.roomCode, roomCode)),
    auth.getSession(),
  ]);
  const meeting = meetingRows[0];
  if (!meeting) {
    return NextResponse.json({ error: "No meeting with that code." }, { status: 404 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  }

  let env: ReturnType<typeof livekitEnv>;
  try {
    env = livekitEnv();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "LiveKit is not configured." },
      { status: 500 }
    );
  }

  const isHost = !!session?.user && meeting.hostUserId === session.user.id;
  const identity = session?.user
    ? `user-${session.user.id}`
    : `guest-${randomUUID().slice(0, 8)}`;
  const name = session?.user?.name?.trim() || displayName || "Guest";

  const entitlements = await resolveEntitlements(meeting.hostUserId);
  const limitMs = entitlements.maxDurationMinutes * 60_000;
  const now = new Date();
  const activeSince = new Date(now.getTime() - limitMs);

  // The host can always enter. Everyone else is capped by the host's plan.
  // The count comes from webhook-backed participant rows, not token intent,
  // so abandoned tokens do not occupy seats. Exclude the caller's own stable
  // identity so a signed-in rejoin does not get blocked by its own row.
  if (!isHost) {
    const [activeRow] = await db
      .select({ active: count() })
      .from(participants)
      .where(
        and(
          eq(participants.meetingId, meeting.id),
          isNull(participants.leftAt),
          gt(participants.joinedAt, activeSince),
          or(isNull(participants.identity), ne(participants.identity, identity))
        )
      );

    if ((activeRow?.active ?? 0) >= entitlements.maxParticipants) {
      return NextResponse.json(
        { error: "This call is full. Try again when someone leaves." },
        { status: 403 }
      );
    }
  }

  // One session per terminal meeting. The first token opens the clock; the
  // webhook promotes the row to live and closes it. A refresh reuses the
  // existing started_at and deadline.
  const [callSession] = await db
    .insert(sessions)
    .values({
      meetingId: meeting.id,
      livekitRoomName: roomCode,
      status: "pending",
      startedAt: now,
      deadlineAt: new Date(now.getTime() + limitMs),
    })
    .onConflictDoUpdate({
      target: sessions.meetingId,
      set: { livekitRoomName: roomCode },
    })
    .returning();

  const window = resolveSessionWindow(callSession, now, limitMs);

  if (window.needsUpdate) {
    await db
      .update(sessions)
      .set({ startedAt: window.startedAt, deadlineAt: window.endsAt })
      .where(eq(sessions.id, callSession.id));
  }

  if (window.endsAt.getTime() <= now.getTime()) {
    await Promise.all([
      db.update(meetings).set({ endedAt: now }).where(eq(meetings.id, meeting.id)),
      db
        .update(sessions)
        .set({ status: "ended", endedAt: now, endReason: "deadline" })
        .where(eq(sessions.id, callSession.id)),
    ]);
    return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  }

  const token = await signJoinToken({ identity, name, roomCode, isHost });

  return NextResponse.json({
    serverUrl: env.url,
    token,
    identity,
    isHost,
    roomCode,
    endsAt: window.endsAt.toISOString(),
    policy: {
      maxParticipants: entitlements.maxParticipants,
      maxDurationMinutes: entitlements.maxDurationMinutes,
    },
  });
}

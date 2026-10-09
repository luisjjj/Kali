import { NextResponse } from "next/server";
import { eq, min } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings, participants } from "@/lib/db/schema";
import { getRoomService } from "@/lib/livekit";
import { CALL_LIMIT_MS } from "@/lib/limits";
import { roomCodeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Objective backstop for the quiet 60 minute limit. Anyone in the call may
// hit it, host or guest: the server re-checks the clock itself, so there is
// nothing to abuse. Past the limit it stamps ended_at and frees the room.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode: raw } = await params;
  const parsed = roomCodeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "That code doesn't look right." }, { status: 400 });
  }

  const rows = await db.select().from(meetings).where(eq(meetings.roomCode, parsed.data));
  const meeting = rows[0];
  if (!meeting) {
    return NextResponse.json({ error: "No meeting with that code." }, { status: 404 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ ended: true });
  }

  const [anchor] = await db
    .select({ startedAt: min(participants.joinedAt) })
    .from(participants)
    .where(eq(participants.meetingId, meeting.id));
  if (!anchor?.startedAt) {
    return NextResponse.json({ ended: false });
  }

  if (anchor.startedAt.getTime() + CALL_LIMIT_MS > Date.now()) {
    return NextResponse.json({ ended: false });
  }

  const [updated] = await db
    .update(meetings)
    .set({ endedAt: new Date() })
    .where(eq(meetings.id, meeting.id))
    .returning();

  try {
    await getRoomService().deleteRoom(parsed.data);
  } catch (err) {
    console.warn("[expire] LiveKit deleteRoom failed:", err);
  }

  return NextResponse.json({ ended: true, meeting: updated });
}

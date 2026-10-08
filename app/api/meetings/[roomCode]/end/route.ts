import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { getRoomService } from "@/lib/livekit";
import { roomCodeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Host-only: stamp ended_at and boot everyone via the LiveKit server SDK.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

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
  if (meeting.hostUserId !== session.user.id) {
    return NextResponse.json({ error: "Only the host can end the meeting." }, { status: 403 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ meeting });
  }

  const [updated] = await db
    .update(meetings)
    .set({ endedAt: new Date() })
    .where(eq(meetings.id, meeting.id))
    .returning();

  // Best effort: delete the LiveKit room so everyone disconnects.
  try {
    await getRoomService().deleteRoom(parsed.data);
  } catch (err) {
    console.warn("[end-meeting] LiveKit deleteRoom failed (room may be empty):", err);
  }

  return NextResponse.json({ meeting: updated });
}

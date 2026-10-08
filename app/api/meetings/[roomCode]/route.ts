import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { roomCodeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Public (guests need it for the lobby): title + status only, no host internals.
export async function GET(
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

  return NextResponse.json({
    meeting: {
      title: meeting.title,
      roomCode: meeting.roomCode,
      scheduledAt: meeting.scheduledAt,
      endedAt: meeting.endedAt,
      createdAt: meeting.createdAt,
    },
  });
}

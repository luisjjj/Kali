import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { getRoomService } from "@/lib/livekit";
import { removeParticipantSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Host-only: remove someone from the call.
export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const parsed = removeParticipantSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (parsed.data.identity === `user-${session.user.id}`) {
    return NextResponse.json({ error: "You can't remove yourself — use leave." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(meetings)
    .where(eq(meetings.roomCode, parsed.data.roomCode));
  const meeting = rows[0];
  if (!meeting) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  if (meeting.hostUserId !== session.user.id) {
    return NextResponse.json({ error: "Only the host can remove people." }, { status: 403 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  }

  try {
    await getRoomService().removeParticipant(parsed.data.roomCode, parsed.data.identity);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("[remove] failed:", err);
    return NextResponse.json({ error: "Couldn't remove them — are they still here?" }, { status: 502 });
  }
}

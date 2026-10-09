import { NextResponse } from "next/server";
import { TrackSource } from "livekit-server-sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { getRoomService } from "@/lib/livekit";
import { muteParticipantSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function hostIdentity(hostUserId: string) {
  return `user-${hostUserId}`;
}

// Host-only: mute someone's mic. Server finds the audio track SID itself.
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
  const parsed = muteParticipantSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (parsed.data.identity === hostIdentity(session.user.id)) {
    return NextResponse.json({ error: "That's you. Use your own mic button." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(meetings)
    .where(eq(meetings.roomCode, parsed.data.roomCode));
  const meeting = rows[0];
  if (!meeting) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  if (meeting.hostUserId !== session.user.id) {
    return NextResponse.json({ error: "Only the host can mute others." }, { status: 403 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  }

  try {
    const room = getRoomService();
    const participant = await room.getParticipant(parsed.data.roomCode, parsed.data.identity);
    const audioTrack = participant.tracks.find((t) => t.source === TrackSource.MICROPHONE);
    if (!audioTrack) {
      return NextResponse.json({ error: "They have no mic track right now." }, { status: 404 });
    }
    await room.mutePublishedTrack(
      parsed.data.roomCode,
      parsed.data.identity,
      audioTrack.sid,
      true
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn("[mute] failed:", err);
    return NextResponse.json({ error: "Couldn't mute them. Are they still here?" }, { status: 502 });
  }
}

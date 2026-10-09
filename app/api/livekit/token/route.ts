import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { livekitEnv, signJoinToken } from "@/lib/livekit";
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

  const rows = await db.select().from(meetings).where(eq(meetings.roomCode, roomCode));
  const meeting = rows[0];
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

  const { data: session } = await auth.getSession();
  const isHost = !!session?.user && meeting.hostUserId === session.user.id;
  const identity = session?.user
    ? `user-${session.user.id}`
    : `guest-${randomUUID().slice(0, 8)}`;
  const name =
    session?.user?.name?.trim() ||
    (session?.user ? displayName : displayName) ||
    "Guest";

  const token = await signJoinToken({ identity, name, roomCode, isHost });

  return NextResponse.json({
    serverUrl: env.url,
    token,
    identity,
    isHost,
    roomCode,
  });
}

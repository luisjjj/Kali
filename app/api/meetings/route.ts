import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { generateRoomCode, meetingLink } from "@/lib/utils";
import { createMeetingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to see your meetings." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(meetings)
    .where(eq(meetings.hostUserId, session.user.id))
    .orderBy(desc(meetings.createdAt));

  const upcoming = rows.filter((m) => !m.endedAt);
  const past = rows.filter((m) => m.endedAt);
  return NextResponse.json({ upcoming, past });
}

export async function POST(req: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to create a meeting." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const parsed = createMeetingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid meeting details." },
      { status: 400 }
    );
  }

  // Short unique room code, retry on collision.
  let roomCode = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const existing = await db.select().from(meetings).where(eq(meetings.roomCode, roomCode));
    if (existing.length === 0) break;
    roomCode = generateRoomCode();
  }

  const [meeting] = await db
    .insert(meetings)
    .values({
      hostUserId: session.user.id,
      title: parsed.data.title || "Quick catch-up",
      roomCode,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    })
    .returning();

  return NextResponse.json(
    { meeting, link: meetingLink(roomCode, process.env.NEXT_PUBLIC_APP_URL) },
    { status: 201 }
  );
}

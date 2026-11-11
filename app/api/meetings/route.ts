import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { generateRoomCode, meetingLink } from "@/lib/utils";
import { isRoomId, looksLikeCompactRoomCode, slugifyRoomName } from "@/lib/room-code";
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

  // Custom room names are optional. Otherwise, pick a short unique code and
  // retry on collision.
  const roomName = parsed.data.roomName?.trim() ?? "";
  let roomCode: string;
  if (roomName) {
    const slug = slugifyRoomName(roomName);
    if (!isRoomId(slug) || looksLikeCompactRoomCode(slug)) {
      return NextResponse.json(
        {
          error:
            "Pick a room name with lowercase letters, numbers, or dashes. If it's nine characters, add a dash so it isn't mistaken for a code.",
        },
        { status: 400 }
      );
    }
    const existing = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(eq(meetings.roomCode, slug))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `kali/m/${slug} is taken. Try another name.` },
        { status: 409 }
      );
    }
    roomCode = slug;
  } else {
    roomCode = generateRoomCode();
    for (let i = 0; i < 5; i++) {
      const existing = await db
        .select({ id: meetings.id })
        .from(meetings)
        .where(eq(meetings.roomCode, roomCode))
        .limit(1);
      if (existing.length === 0) break;
      if (i === 4) {
        return NextResponse.json(
          { error: "Couldn't find a free room code. Try again." },
          { status: 503 }
        );
      }
      roomCode = generateRoomCode();
    }
  }

  let meeting;
  try {
    [meeting] = await db
      .insert(meetings)
      .values({
        hostUserId: session.user.id,
        title: parsed.data.title || "Quick catch-up",
        roomCode,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      })
      .returning();
  } catch (err) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? (err as { code?: string }).code
        : undefined;
    if (roomName && code === "23505") {
      return NextResponse.json(
        { error: `kali/m/${roomCode} was just taken. Try another name.` },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json(
    { meeting, link: meetingLink(roomCode, process.env.NEXT_PUBLIC_APP_URL) },
    { status: 201 }
  );
}

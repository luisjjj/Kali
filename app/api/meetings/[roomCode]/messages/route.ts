import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings, messages } from "@/lib/db/schema";
import { chatMessageSchema, roomCodeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

async function findMeeting(raw: string) {
  const parsed = roomCodeSchema.safeParse(raw);
  if (!parsed.success) return { error: "That code doesn't look right." as const };
  const rows = await db.select().from(meetings).where(eq(meetings.roomCode, parsed.data));
  if (!rows[0]) return { error: "No meeting with that code." as const };
  return { meeting: rows[0] };
}

// Chat history survives refresh. Guests can read and write with an unguessable code.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode: raw } = await params;
  const found = await findMeeting(raw);
  if ("error" in found) {
    return NextResponse.json({ error: found.error }, { status: 404 });
  }

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.meetingId, found.meeting.id))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({ messages: history });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode: raw } = await params;
  const found = await findMeeting(raw);
  if ("error" in found) {
    return NextResponse.json({ error: found.error }, { status: 404 });
  }
  if (found.meeting.endedAt) {
    return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const parsed = chatMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 }
    );
  }

  const [saved] = await db
    .insert(messages)
    .values({
      meetingId: found.meeting.id,
      senderName: parsed.data.senderName,
      body: parsed.data.body,
    })
    .returning();

  return NextResponse.json({ message: saved }, { status: 201 });
}

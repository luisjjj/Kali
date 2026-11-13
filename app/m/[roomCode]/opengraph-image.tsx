import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { roomCodeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const alt = "Join a call on Kali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function shorten(value: string, max = 52) {
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export default async function Image({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode: raw } = await params;
  const parsed = roomCodeSchema.safeParse(raw);

  let meeting: { title: string; roomCode: string; endedAt: Date | null } | null = null;
  if (parsed.success) {
    try {
      const rows = await db
        .select({
          title: meetings.title,
          roomCode: meetings.roomCode,
          endedAt: meetings.endedAt,
        })
        .from(meetings)
        .where(eq(meetings.roomCode, parsed.data))
        .limit(1);
      meeting = rows[0] ?? null;
    } catch {
      meeting = null;
    }
  }

  const title = meeting ? shorten(meeting.title) : "A call is waiting for you";
  const room = meeting?.roomCode ?? (parsed.success ? parsed.data : "your-room");
  const ended = Boolean(meeting?.endedAt);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffb3cd",
          backgroundImage: "radial-gradient(rgba(23,20,18,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "#171412",
          padding: "60px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 54, fontWeight: 800, letterSpacing: -3 }}>
            kali<span style={{ color: "#171412" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#fffbf9",
              color: "#171412",
              border: "1px solid rgba(23,20,18,0.14)",
              borderRadius: 999,
              padding: "12px 26px",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: ended ? "#cf3349" : "#168a53",
              }}
            />
            {ended ? "Call ended" : "You're invited"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 28 }}>
            <div
              style={{
                display: "flex",
                backgroundColor: "#fffbf9",
                border: "1px solid rgba(23,20,18,0.14)",
                borderRadius: 16,
                padding: "12px 26px",
                fontSize: 28,
                fontWeight: 600,
                color: "#6f4a58",
              }}
            >
              kali/m/{room}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: "#6f4a58" }}>
            No account. No download. Just tap.
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#171412",
              color: "#fffbf9",
              borderRadius: 999,
              padding: "14px 30px",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Join the call
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

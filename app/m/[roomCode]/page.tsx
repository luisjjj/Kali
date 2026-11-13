import { cache } from "react";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { roomCodeSchema } from "@/lib/validations";
import { MeetingFlow } from "@/components/meeting/meeting-flow";
import { EndedScreen } from "@/components/meeting/ended-screen";
import { ErrorState } from "@/components/ui/states";
import { KaliWordmark } from "@/components/ui/brand";
import { HomeLink } from "@/components/ui/home-link";
import { Button } from "@/components/ui/button";
import { Doodles } from "@/components/ui/doodles";

export const dynamic = "force-dynamic";

const findMeeting = cache(async (roomCode: string) => {
  const rows = await db
    .select()
    .from(meetings)
    .where(eq(meetings.roomCode, roomCode))
    .limit(1);
  return rows[0] ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}): Promise<Metadata> {
  const { roomCode: raw } = await params;
  const parsed = roomCodeSchema.safeParse(raw);
  if (!parsed.success) {
    return { title: "Room not found · Kali", robots: { index: false, follow: false } };
  }

  const meeting = await findMeeting(parsed.data);
  if (!meeting) {
    return { title: "Room not found · Kali", robots: { index: false, follow: false } };
  }

  const path = `/m/${meeting.roomCode}`;
  const title = meeting.endedAt
    ? `${meeting.title} · call ended on Kali`
    : `${meeting.title} · join on Kali`;
  const description = meeting.endedAt
    ? `“${meeting.title}” has ended. Start your own free call on Kali in seconds.`
    : `Tap to join “${meeting.title}” on Kali. No account or download needed. Room: kali/m/${meeting.roomCode}.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Kali",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomCode: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { roomCode: raw } = await params;
  const { name: nameHint } = await searchParams;
  const parsed = roomCodeSchema.safeParse(raw);

  if (!parsed.success) {
    return (
      <Shell>
        <ErrorState
          title="That link looks off"
          body="Room links look like kali/m/study-gang or kali/m/abc-def-ghi. Check the link and try again."
        />
      </Shell>
    );
  }

  const meeting = await findMeeting(parsed.data);

  if (!meeting) {
    return (
      <Shell>
        <ErrorState
          title="No call here, sorry"
          body="This room doesn't exist. Maybe the link is old. Ask the host for a fresh one."
        />
      </Shell>
    );
  }

  if (meeting.endedAt) {
    return <EndedScreen title={meeting.title} />;
  }

  const { data: session } = await auth.getSession();
  const isHost = !!session?.user && meeting.hostUserId === session.user.id;
  const hintedName =
    typeof nameHint === "string" && nameHint.trim()
      ? nameHint.trim().slice(0, 40)
      : "";

  return (
    <MeetingFlow
      roomCode={meeting.roomCode}
      title={meeting.title}
      defaultName={session?.user?.name ?? hintedName}
      isHost={isHost}
    />
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center gap-6 overflow-x-clip px-5 py-10">
      <Doodles className="-z-10" />
      <KaliWordmark />
      <div className="w-full max-w-md">{children}</div>
      <HomeLink>
        <Button variant="ghost" size="sm">
          Back home
        </Button>
      </HomeLink>
    </div>
  );
}

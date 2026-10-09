import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { roomCodeSchema } from "@/lib/validations";
import { MeetingFlow } from "@/components/meeting/meeting-flow";
import { EndedScreen } from "@/components/meeting/ended-screen";
import { ErrorState } from "@/components/ui/states";
import { KaliWordmark } from "@/components/ui/brand";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

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
          body="Room codes look like abc-def-ghi. Check the link and try again."
        />
      </Shell>
    );
  }

  const rows = await db.select().from(meetings).where(eq(meetings.roomCode, parsed.data));
  const meeting = rows[0];

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
    <div className="flex min-h-screen flex-col items-center gap-6 bg-kali-paper px-5 py-10 dark:bg-kali-ink">
      <KaliWordmark />
      <div className="w-full max-w-md">{children}</div>
      <Link href="/">
        <Button variant="ghost" size="sm">
          Back home
        </Button>
      </Link>
    </div>
  );
}

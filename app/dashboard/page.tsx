import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const rows = await db
    .select()
    .from(meetings)
    .where(eq(meetings.hostUserId, session.user.id))
    .orderBy(desc(meetings.createdAt));

  const upcoming = rows.filter((m) => !m.endedAt);
  const past = rows.filter((m) => m.endedAt);

  return (
    <div className="min-h-screen bg-kali-paper dark:bg-kali-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <form action="/auth/sign-out" method="post">
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16">
        <DashboardClient
          upcoming={upcoming}
          past={past}
          userName={session.user.name ?? "friend"}
        />
      </main>
    </div>
  );
}

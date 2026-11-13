import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetings } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    <div className="relative isolate min-h-screen overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <KaliWordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/auth/sign-out" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16">
        <DashboardOverview
          upcoming={upcoming}
          past={past}
          userName={session.user.name ?? "friend"}
        />
      </main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div className="min-h-screen bg-kali-paper dark:bg-kali-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-kali-pink-pale px-4 py-2 text-sm font-bold sm:block">
            Hey, {session.user.name ?? "friend"}!
          </span>
          <form action="/auth/sign-out" method="post">
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-16">
        <section className="rounded-[32px] bg-kali-ink p-8 text-white sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready when you are.
          </h1>
          <p className="mt-2 max-w-lg font-medium text-white/70">
            Meetings, scheduling, and live rooms are landing here next. Your auth and database are
            already wired up.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" size="md" disabled>
              New meeting (next)
            </Button>
            <Button variant="ghost" size="md" className="bg-white/10 text-white" disabled>
              Join with code (next)
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardTitle>Upcoming</CardTitle>
            <CardText>Nothing scheduled yet. Enjoy the calm.</CardText>
          </Card>
          <Card>
            <CardTitle>Past calls</CardTitle>
            <CardText>Your history will show up here once you host a room.</CardText>
          </Card>
        </section>

        <EmptyState
          title="Live rooms are almost here"
          body="Next up: meeting creation, shareable links, and the LiveKit token endpoint. Check LIVEKIT_SETUP.md to get your Cloud project ready."
          action={
            <Link href="/">
              <Button variant="secondary" size="sm">
                Back home
              </Button>
            </Link>
          }
        />
      </main>
    </div>
  );
}

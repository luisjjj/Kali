import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Badge, LiveDot } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: session } = await auth.getSession();

  return (
    <div className="flex min-h-screen flex-col bg-kali-paper text-kali-ink dark:bg-kali-ink dark:text-kali-paper">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <nav className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <form action="/auth/sign-out" method="post">
                <Button variant="primary" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 pb-16">
        <section className="grid gap-6 rounded-[32px] bg-kali-pink p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
          <div className="flex flex-col items-start gap-5">
            <Badge tone="ink">
              <LiveDot /> friendly video calls
            </Badge>
            <h1 className="text-5xl leading-[1.02] font-extrabold tracking-tight text-kali-ink sm:text-6xl lg:text-7xl">
              Start a call, no fuss.
            </h1>
            <p className="max-w-md text-lg leading-relaxed font-medium text-kali-ink/80">
              Kali gives you an instant room, a cute link, and chat that sticks around. No downloads,
              no drama.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={session?.user ? "/dashboard" : "/auth/sign-up"}>
                <Button variant="primary" size="lg">
                  {session?.user ? "Go to dashboard" : "Start a free call"}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-kali-ink/10">
                  Join with code
                </Button>
              </Link>
            </div>
            <p className="text-sm font-semibold text-kali-ink/60">
              Free while we&apos;re little. Bring a friend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[24px] bg-kali-ink p-6 text-white">
              <p className="text-4xl font-extrabold">1</p>
              <p className="mt-1 font-bold">Make a room</p>
              <p className="text-sm text-white/70">One tap, one link. That&apos;s it.</p>
            </div>
            <div className="mt-6 rounded-[24px] bg-white p-6">
              <p className="text-4xl font-extrabold">2</p>
              <p className="mt-1 font-bold">Share it</p>
              <p className="text-sm text-kali-muted">Friends join from any phone.</p>
            </div>
            <div className="rounded-[24px] bg-white p-6">
              <p className="text-4xl font-extrabold">3</p>
              <p className="mt-1 font-bold">Chat + talk</p>
              <p className="text-sm text-kali-muted">Video, audio, and live chat.</p>
            </div>
            <div className="mt-6 rounded-[24px] bg-kali-ink p-6 text-white">
              <p className="text-4xl font-extrabold">✳</p>
              <p className="mt-1 font-bold">All yours</p>
              <p className="text-sm text-white/70">History saves automatically.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 bg-white dark:bg-white/5">
            <CardTitle>Instant rooms</CardTitle>
            <CardText>New meeting in one click. Share /m/your-code and you&apos;re live.</CardText>
          </Card>
          <Card className="border-0 bg-kali-pink-pale/70 dark:bg-white/5">
            <CardTitle>Guests welcome</CardTitle>
            <CardText>No account needed to join. Just pick a display name and hop in.</CardText>
          </Card>
          <Card className="border-0 bg-white dark:bg-white/5">
            <CardTitle>Host in control</CardTitle>
            <CardText>Mute, remove, or end for everyone. Server-enforced, not just vibes.</CardText>
          </Card>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-sm font-semibold text-kali-muted">
        Made with care by Kali. Be kind on calls.
      </footer>
    </div>
  );
}

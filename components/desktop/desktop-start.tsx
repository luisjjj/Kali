import Link from "next/link";
import { ArrowRight, Monitor } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Doodles } from "@/components/ui/doodles";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInForm } from "@/components/auth/sign-in-form";
import { JoinForm } from "@/components/join/join-form";

type DesktopStartProps = {
  user: { name: string | null } | null;
};

export function DesktopStart({ user }: DesktopStartProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-kali-pink text-kali-ink dark:bg-black dark:text-kali-paper">
      <Doodles className="-z-10" />
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <KaliWordmark href="/desktop" />
        <div className="flex items-center gap-3">
          <Badge tone="ink" className="hidden sm:inline-flex">
            <Monitor className="h-3.5 w-3.5" weight="bold" />
            Windows desktop
          </Badge>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-start px-5 pb-8 [@media(min-height:760px)]:justify-center">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-kali-ink/65 uppercase dark:text-kali-paper/65">
            Kali for Windows
          </p>
          <h1 className="display-tight mt-1 text-4xl font-semibold">
            Start a call, or join one<span className="text-kali-ink dark:text-kali-pink">.</span>
          </h1>
          <p className="mt-2 text-base text-kali-ink/70 dark:text-kali-paper/70">
            Sign in to host your own room, or use a room name to jump into a call.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-kali-ink/10 sm:p-7 dark:bg-white/5 dark:ring-1 dark:ring-white/10">
            {user ? (
              <div className="flex h-full flex-col">
                <p className="text-sm font-semibold tracking-widest text-kali-ink/60 uppercase dark:text-kali-paper/60">
                  Signed in
                </p>
                <h2 className="display-tight mt-1 text-3xl font-semibold">
                  Welcome back{user.name ? `, ${user.name}` : ""}.
                </h2>
                <p className="mt-2 text-kali-ink/65 dark:text-kali-paper/65">
                  Your rooms are waiting. Open the dashboard to start a new meeting.
                </p>
                <div className="mt-auto pt-5">
                  <Button asChild variant="primary" size="lg" className="w-full">
                    <Link href="/dashboard">
                      Open dashboard <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <p className="text-sm font-semibold tracking-widest text-kali-ink/60 uppercase dark:text-kali-paper/60">
                  Host a call
                </p>
                <h2 className="display-tight mt-1 text-3xl font-semibold">Sign in</h2>
                <p className="mt-2 text-kali-ink/65 dark:text-kali-paper/65">
                  Hosts need a free account. Guests can join with a link.
                </p>
                <div className="mt-5">
                  <SignInForm idPrefix="desktop" />
                </div>
                <p className="mt-3 text-sm font-semibold text-kali-ink/65 dark:text-kali-paper/65">
                  New here?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-bold text-kali-ink underline dark:text-kali-paper"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[32px] bg-kali-ink p-6 text-white shadow-xl shadow-kali-ink/25 sm:p-7 dark:ring-1 dark:ring-white/10">
            <p className="text-sm font-semibold tracking-widest text-kali-pink uppercase">
              Join a call
            </p>
            <h2 className="display-tight mt-1 text-3xl font-semibold">
              Got a link? You&apos;re in<span className="text-kali-pink">.</span>
            </h2>
            <p className="mt-2 text-white/65">
              No account needed. Just the room name and whatever we should call you.
            </p>
            <div className="mt-5">
              <JoinForm tone="dark" idPrefix="desktop" />
            </div>
          </section>
        </div>
      </main>

      <footer className="relative mx-auto w-full max-w-5xl px-5 pb-6">
        <p className="text-sm font-semibold text-kali-ink/55 dark:text-kali-paper/55">
          Calls need a network. The desktop app keeps your session signed in.
        </p>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Monitor, SignIn } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInForm } from "@/components/auth/sign-in-form";
import { JoinForm } from "@/components/join/join-form";
import { Doodles } from "@/components/ui/doodles";

type DesktopStartProps = {
  user: { name: string | null } | null;
};

export function DesktopStart({ user }: DesktopStartProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <Doodles className="-z-10" />
      <header className="border-b border-line bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-3.5">
          <KaliWordmark href="/desktop" />
          <div className="flex items-center gap-3">
            <Badge tone="pink" className="hidden sm:inline-flex">
              <Monitor className="h-3.5 w-3.5" weight="bold" />
              Windows desktop
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-start px-5 py-10 pb-8 [@media(min-height:760px)]:justify-center">
        <div className="mb-8 max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
            <span className="h-px w-5 bg-kali-pink" />
            Kali for Windows
          </p>
          <h1 className="display-tight mt-3 text-4xl font-semibold">
            Start a call, or join one<span className="text-kali-pink">.</span>
          </h1>
          <p className="mt-2 text-base leading-relaxed text-kali-muted">
            Sign in to host your own room, or use a room name to jump into a call.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="kali-card p-6 sm:p-7">
            {user ? (
              <div className="flex h-full flex-col">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kali-pink-pale text-sm font-semibold text-kali-pink">
                  {(user.name?.trim()[0] ?? "?").toUpperCase()}
                </span>
                <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
                  Signed in
                </p>
                <h2 className="display-tight mt-1 text-2xl font-semibold">
                  Welcome back{user.name ? `, ${user.name}` : ""}.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-kali-muted">
                  Your rooms are waiting. Open the dashboard to start a new meeting.
                </p>
                <div className="mt-auto pt-5">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/dashboard">
                      Open dashboard <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kali-pink-pale text-kali-pink">
                  <SignIn className="h-5 w-5" weight="bold" />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
                  Host a call
                </p>
                <h2 className="display-tight mt-1 text-2xl font-semibold">Sign in</h2>
                <p className="mt-2 text-sm leading-relaxed text-kali-muted">
                  Hosts need a free account. Guests can join with a link.
                </p>
                <div className="mt-5">
                  <SignInForm idPrefix="desktop" />
                </div>
                <p className="mt-3 text-sm text-kali-muted">
                  New here?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </section>

          <section className="kali-card p-6 sm:p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kali-pink-pale text-kali-pink">
              <Monitor className="h-5 w-5" weight="bold" />
            </span>
            <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
              Join a call
            </p>
            <h2 className="display-tight mt-1 text-2xl font-semibold">
              Got a link? You&apos;re in<span className="text-kali-pink">.</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-kali-muted">
              No account needed. Just the room name and whatever we should call you.
            </p>
            <div className="mt-5">
              <JoinForm idPrefix="desktop" />
            </div>
          </section>
        </div>
      </main>

      <footer className="relative mx-auto w-full max-w-5xl px-5 pb-6">
        <p className="text-sm text-kali-muted">
          Calls need a network. The desktop app keeps your session signed in.
        </p>
      </footer>
    </div>
  );
}

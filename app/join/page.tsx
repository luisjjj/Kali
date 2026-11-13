import { Check } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HomeLink } from "@/components/ui/home-link";
import { JoinForm } from "@/components/join/join-form";
import { PoweredByKali, StartYourOwnCall } from "@/components/join/host-cta";
import { Doodles } from "@/components/ui/doodles";

export default function JoinPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <Doodles className="-z-10" />
      <header className="sticky top-0 z-30 border-b border-line bg-[var(--background)]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <KaliWordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <HomeLink>
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </HomeLink>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:py-20">
        <section className="hidden lg:block">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
            <span className="h-px w-5 bg-kali-accent" />
            Join as a guest
          </p>
          <h1 className="display-tight mt-4 max-w-md text-5xl leading-[1.03] font-semibold">
            Someone saved you a seat<span className="text-kali-accent">.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-kali-muted">
            Drop the room name and your name. You&apos;re in the call in seconds, no account and no
            downloads.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm font-medium">
            {["Works on any phone, laptop or tablet", "No account or app store", "Leave whenever you like"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-kali-pink">
                    <Check className="h-3.5 w-3.5" weight="bold" />
                  </span>
                  {t}
                </li>
              )
            )}
          </ul>
          <div className="mt-10 flex max-w-sm items-center gap-3 rounded-xl border border-line bg-surface p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kali-pink-pale text-sm font-semibold text-foreground">
              SG
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Study gang</p>
              <p className="truncate text-xs text-kali-muted">kali/m/study-gang · 4 people waiting</p>
            </div>
            <span className="ml-auto shrink-0 rounded-md bg-kali-success/10 px-2 py-1 text-[11px] font-semibold text-kali-success">
              Live
            </span>
          </div>
        </section>

        <section className="kali-card mx-auto w-full max-w-md p-7 sm:p-9">
          <p className="text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase lg:hidden">
            Join as a guest
          </p>
          <h1 className="display-tight mt-2 text-3xl font-semibold sm:text-4xl">
            Got a link or code? You&apos;re in<span className="text-kali-accent">.</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-kali-muted">
            No account needed. Just the room name and whatever we should call you.
          </p>

          <div className="mt-6">
            <JoinForm />
          </div>

          <div className="mt-7 border-t border-line pt-5">
            <p className="mb-3 text-center text-sm text-kali-muted">Want a room of your own?</p>
            <StartYourOwnCall variant="outline" size="md" className="w-full" />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 pb-8">
        <PoweredByKali />
      </footer>
    </div>
  );
}

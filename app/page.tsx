import Link from "next/link";
import {
  ArrowRight,
  VideoCamera,
  ChatCircleText,
  Crown,
  Gauge,
  ShieldCheck,
  Lightning,
  Users,
  Microphone,
  MonitorArrowUp,
  PhoneDisconnect,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Faq } from "@/components/ui/faq";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Doodles } from "@/components/ui/doodles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "No downloads",
  "Guests welcome",
  "Live chat that saves",
  "Host controls",
  "Audio-only mode",
  "Shareable links",
  "Screen sharing",
  "Free while we're little",
];

const FEATURES = [
  {
    icon: Lightning,
    title: "Instant rooms",
    body: "One tap makes a room and a link you can actually remember. Share it and you're live in seconds.",
  },
  {
    icon: Users,
    title: "Guests welcome",
    body: "Friends join from any phone or laptop with just a display name. No account, no app store, no onboarding.",
  },
  {
    icon: ChatCircleText,
    title: "Chat that sticks around",
    body: "In-call chat arrives instantly and saves itself automatically. Refresh all you want. Receipts kept.",
  },
  {
    icon: Crown,
    title: "Host stays in charge",
    body: "Mute a loud mic, remove a party crasher, or end the call for everyone. It just works, every time.",
  },
  {
    icon: Gauge,
    title: "Survives bad wifi",
    body: "Picture stays sharp on its own, with signal dots for everyone. Flip on audio-only mode when the tunnel hits.",
  },
  {
    icon: MonitorArrowUp,
    title: "Present like a pro",
    body: "One-tap screen sharing with its own spotlight tile, so your slides get the stage and faces stay in the wings.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Make a room",
    body: "Sign in, hit New meeting, grab your link. Ten seconds, tops.",
  },
  {
    n: "02",
    title: "Share it anywhere",
    body: "Text it, drop it in the group chat, shout it across the room. Guests join straight from the browser.",
  },
  {
    n: "03",
    title: "Talk, chat, bounce",
    body: "Video, audio and live chat in one place. Host ends it for everyone when the gossip runs out.",
  },
];

const FAQS = [
  {
    q: "Do guests need an account?",
    a: "Nope. Anyone with your room link picks a display name and joins from their browser. Only hosts need a Kali account to create rooms.",
  },
  {
    q: "Do I need to install anything?",
    a: "Nothing. Kali runs in the browser, from phones and tablets to laptops and borrowed Chromebooks. On Windows you can also grab the optional desktop app from the footer, but you never need it.",
  },
  {
    q: "Is my call private?",
    a: "Every call gets its own private link. Pick a name you'll remember, or let Kali make a random code. Only the host can mute, remove, or end things. Guests can just relax.",
  },
  {
    q: "What happens to chat history?",
    a: "Every message is saved as it's sent, so history survives refreshes and re-joins. Ended rooms keep their story; new rooms start fresh.",
  },
  {
    q: "My wifi is terrible. Will Kali cope?",
    a: "That's literally what audio-only mode is for. One tap drops all video and keeps voices crystal clear. Little signal dots show who's struggling before they freeze mid-sentence.",
  },
  {
    q: "How long can calls run?",
    a: "An hour. You get a friendly nudge at 55 minutes, then the room wraps itself up. Need more time. Start a fresh room and share the new link.",
  },
  {
    q: "How much does it cost?",
    a: "Everything is free right now. Pro at $7 a month and Pro Plus at $15 a month arrive when billing switches on, and early folks hear about it first.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tag: "For spontaneous calls",
    features: [
      "Group calls up to an hour",
      "Guests join with a link, no account",
      "Room links you can remember",
      "Live chat that saves itself",
      "Audio-only mode for rough wifi",
      "Screen sharing",
    ],
    cta: "Start free",
    live: true,
    featured: false,
  },
  {
    name: "Pro",
    price: "$7",
    tag: "For people who host a lot",
    features: [
      "Everything in Free",
      "Calls up to three hours",
      "Pinned rooms waiting on your dashboard",
      "First dibs on new features",
    ],
    cta: "Get Pro",
    live: false,
    featured: true,
  },
  {
    name: "Pro Plus",
    price: "$15",
    tag: "For teams and serial hosts",
    features: [
      "Everything in Pro",
      "Calls up to eight hours",
      "Call recordings saved to your library",
      "Room templates you can reuse",
      "A calmer lobby for bigger crowds",
    ],
    cta: "Get Pro Plus",
    live: false,
    featured: false,
  },
];

export default async function Home() {
  const { data: session } = await auth.getSession();
  const ctaHref = session?.user ? "/dashboard" : "/auth/sign-up";

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <Doodles className="-z-10" />
      <header className="sticky top-0 z-40 border-b border-line bg-[var(--background)]/85 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <KaliWordmark />
          <nav className="hidden items-center gap-7 text-sm font-medium text-kali-muted md:flex">
            <a href="#features" className="nav-link transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="nav-link transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#hosts" className="nav-link transition-colors hover:text-foreground">
              For hosts
            </a>
            <a href="#pricing" className="nav-link transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="nav-link transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/join" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Join a call
              </Button>
            </Link>
            {session?.user ? (
              <Link href="/dashboard">
                <Button size="sm">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="kali-canvas pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-14 pb-12 lg:grid-cols-[1.02fr_0.98fr] lg:pt-24 lg:pb-20">
            <div className="flex flex-col items-start gap-6">
              <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-kali-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-kali-pink" />
                Video calls, without the fuss
              </span>
              <h1 className="display-tight animate-fade-up delay-1 text-[2.85rem] leading-[1.02] font-semibold sm:text-6xl lg:text-[4.25rem]">
                Start a call,
                <br />
                no fuss<span className="text-kali-pink">.</span>
              </h1>
              <p className="animate-fade-up delay-2 max-w-lg text-lg leading-relaxed text-kali-muted">
                Kali skips the boring parts of video calls. Instant rooms, guest links, and live
                chat that saves itself. Free while we&apos;re little.
              </p>
              <div className="animate-fade-up delay-3 flex flex-wrap gap-3">
                <Link href={ctaHref}>
                  <Button size="lg">
                    {session?.user ? "Go to dashboard" : "Start a free call"}{" "}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="outline" size="lg">
                    Join with a link
                  </Button>
                </Link>
              </div>
              <div className="animate-fade-up delay-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-kali-muted">
                {["Free, no card", "No downloads", "Guests need no account"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-kali-pink" weight="bold" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Product mock */}
            <div className="animate-fade-up delay-2 relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="kali-card overflow-hidden p-2.5">
                <div className="mb-2.5 flex items-center gap-1.5 px-2 pt-1">
                  <span className="h-2 w-2 rounded-full bg-foreground/15" />
                  <span className="h-2 w-2 rounded-full bg-foreground/15" />
                  <span className="h-2 w-2 rounded-full bg-foreground/15" />
                  <span className="ml-2 truncate rounded-md border border-line bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium text-kali-muted">
                    kali/m/friday-gossip
                  </span>
                </div>
                <div className="rounded-xl bg-kali-ink p-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <MockTile name="Ada (you)" speaking />
                    <MockTile name="Grace" />
                    <MockTile name="Hedy" muted />
                    <MockTile name="Katherine" sharing />
                  </div>
                  <div className="mt-2.5 flex items-center justify-center gap-2 rounded-lg bg-white/8 px-3 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                      <Microphone className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                      <VideoCamera className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                      <MonitorArrowUp className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kali-danger text-white">
                      <PhoneDisconnect className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold text-foreground">Grace</p>
                <p className="text-[11px] text-kali-muted">wait, you&apos;re muted?</p>
              </div>
              <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-sm">
                <Check className="h-3.5 w-3.5 text-kali-success" weight="bold" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Link copied</p>
                  <p className="text-[11px] text-kali-muted">kali/m/study-gang</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-line bg-[var(--surface-muted)] py-3">
          <div className="animate-marquee flex w-max gap-8 pr-8">
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-8 text-[11px] font-semibold tracking-[0.18em] whitespace-nowrap text-kali-muted uppercase"
              >
                {t}
                <span className="h-1 w-1 rounded-full bg-kali-pink" />
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <Eyebrow>Why Kali</Eyebrow>
          <h2 className="display-tight mt-3 max-w-2xl text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
            Everything you need. None of the blah<span className="text-kali-pink">.</span>
          </h2>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-kali-muted">
            Built for friend groups, study sessions, standups and long-distance gossip, not board
            meetings.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="kali-card kali-lift p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-[var(--surface-muted)] text-kali-pink">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 leading-relaxed text-kali-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-line bg-[var(--surface-muted)]">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-24">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="display-tight mt-3 max-w-xl text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
              Live in three tiny steps<span className="text-kali-pink">.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <article key={s.n} className="kali-card p-6">
                  <p className="text-xs font-semibold tracking-[0.18em] text-kali-pink">{s.n}</p>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-kali-muted">{s.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ctaHref}>
                <Button size="lg">
                  Try step one now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="outline" size="lg">
                  I have a link
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Hosts / trust */}
        <section id="hosts" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>For hosts</Eyebrow>
              <h2 className="display-tight mt-3 text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
                You&apos;re the host. Act like it<span className="text-kali-pink">.</span>
              </h2>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-kali-muted">
                Real host powers that always work. No fine print, no funny business.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Mute any mic mid-sentence (lovingly)",
                  "Remove anyone, instantly",
                  "End the whole call for everyone",
                  "See who's struggling with live connection dots",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
                      <Check className="h-3.5 w-3.5" weight="bold" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="kali-card p-6 sm:p-8">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-kali-ink text-kali-pink">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">Good to know</h3>
              <dl className="mt-5 flex flex-col gap-2.5">
                {[
                  ["Calls", "Video and voice run on fast servers around the world, so calls stay smooth."],
                  ["Memory", "Your rooms and chats are saved for you. Pick up right where you left off."],
                  ["Safety", "Only the host can mute, remove, or end a call. Guests can just relax."],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line bg-[var(--surface-muted)] px-4 py-3.5">
                    <dt className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-kali-muted uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-kali-pink" />
                      {k}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-foreground/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <Eyebrow>Pricing</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-tight max-w-xl text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
              Simple prices, zero surprises<span className="text-kali-pink">.</span>
            </h2>
            <Badge tone="pink">Billing not switched on yet</Badge>
          </div>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-kali-muted">
            Everything is free while we&apos;re little. Paid plans wait in the wings for when we
            switch billing on.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.name}
                className={cn(
                  "relative flex flex-col rounded-[20px] border p-6",
                  p.featured
                    ? "border-kali-ink bg-kali-ink text-white dark:border-kali-pink/40 dark:bg-[var(--surface)]"
                    : "border-line bg-surface text-foreground"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                  {p.featured ? (
                    <Badge tone="pink">Most popular</Badge>
                  ) : !p.live ? (
                    <Badge tone="ink">Soon</Badge>
                  ) : null}
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    p.featured ? "text-white/60 dark:text-kali-muted" : "text-kali-muted"
                  )}
                >
                  {p.tag}
                </p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="display-tight text-5xl font-semibold">{p.price}</span>
                  <span
                    className={cn(
                      "text-sm",
                      p.featured ? "text-white/55 dark:text-kali-muted" : "text-kali-muted"
                    )}
                  >
                    / month
                  </span>
                </p>
                <ul className="mt-5 flex flex-col gap-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          p.featured ? "text-kali-pink" : "text-kali-success"
                        )}
                        weight="bold"
                      />
                      <span
                        className={
                          p.featured ? "text-white/85 dark:text-foreground/85" : "text-foreground/80"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {p.live ? (
                    <Link href={ctaHref}>
                      <Button className="w-full">
                        {p.cta} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={p.featured ? "primary" : "outline"}
                      className="w-full"
                      disabled
                    >
                      {p.cta}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-kali-muted">
            No card needed today. When billing switches on, we tell you first and the prices stay
            as shown.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-5 pb-16 lg:pb-24">
          <Eyebrow className="justify-center">FAQ</Eyebrow>
          <h2 className="display-tight mt-3 text-center text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
            Asking for a friend<span className="text-kali-pink">?</span>
          </h2>
          <Faq items={FAQS} />
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 lg:pb-24">
          <div className="relative overflow-hidden rounded-[24px] border border-line bg-kali-ink text-center text-white">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-kali-pink/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-5 px-6 py-14 sm:py-20">
              <p className="text-xs font-semibold tracking-[0.18em] text-kali-pink uppercase">
                Last chance (not really)
              </p>
              <h2 className="display-tight max-w-2xl text-3xl font-semibold sm:text-5xl sm:leading-[1.05]">
                Your next call could take ten seconds to start.
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={ctaHref}>
                  <Button size="lg">
                    {session?.user ? "Open your dashboard" : "Make your first room"}{" "}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/join">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                  >
                    Join as a guest
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/55">
                Hosting needs a free account. Joining just needs a name.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <KaliWordmark />
          <p className="text-sm text-kali-muted">Made with care by Kali. Be kind on calls.</p>
          <div className="flex gap-5 text-sm font-medium text-kali-muted">
            <Link href="/join" className="transition-colors hover:text-foreground">
              Join
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/auth/sign-up" className="transition-colors hover:text-foreground">
              Sign up
            </Link>
            <a
              href="https://github.com/luisjjj/Kali/releases/latest"
              className="transition-colors hover:text-foreground"
            >
              Windows app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase",
        className
      )}
    >
      <span className="h-px w-5 bg-kali-pink" />
      {children}
    </p>
  );
}

function MockTile({
  name,
  speaking,
  muted,
  sharing,
}: {
  name: string;
  speaking?: boolean;
  muted?: boolean;
  sharing?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center rounded-lg bg-white/8",
        speaking && "kali-speaking bg-white/15"
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
        {name[0]}
      </span>
      <span className="absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
        {name}
      </span>
      {muted && (
        <span className="absolute right-1 bottom-1 rounded bg-kali-danger p-0.5 text-white">
          <Microphone className="h-2.5 w-2.5" />
        </span>
      )}
      {sharing && (
        <span className="absolute top-1 right-1 rounded bg-kali-pink p-0.5 text-white">
          <MonitorArrowUp className="h-2.5 w-2.5" weight="bold" />
        </span>
      )}
    </div>
  );
}

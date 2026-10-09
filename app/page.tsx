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
  CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth/server";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";

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
    tile: "bg-kali-ink text-white",
    title: "Instant rooms",
    body: "One tap makes a room and a cute link. Share your link and you're live in seconds — no planning headaches.",
  },
  {
    icon: Users,
    tile: "bg-kali-pink text-kali-ink",
    title: "Guests welcome",
    body: "Friends join from any phone or laptop with just a display name. No account, no app store, no awkward onboarding.",
  },
  {
    icon: ChatCircleText,
    tile: "bg-kali-ink text-white",
    title: "Chat that sticks around",
    body: "In-call chat arrives instantly and saves itself automatically. Refresh all you want — receipts kept.",
  },
  {
    icon: Crown,
    tile: "bg-kali-pink text-kali-ink",
    title: "Host stays in charge",
    body: "Mute a loud mic, remove a party crasher, or end the call for everyone. It just works, every time.",
  },
  {
    icon: Gauge,
    tile: "bg-kali-ink text-white",
    title: "Survives bad wifi",
    body: "Picture stays sharp on its own, with little signal dots for everyone. Flip on audio-only mode when the train tunnel hits.",
  },
  {
    icon: MonitorArrowUp,
    tile: "bg-kali-pink text-kali-ink",
    title: "Present like a pro",
    body: "One-tap screen sharing with its own spotlight tile, so your slides get the stage and faces stay in the wings.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Make a room",
    body: "Sign in, hit New meeting, grab your link. Ten seconds, tops.",
  },
  {
    n: "2",
    title: "Share it anywhere",
    body: "Text it, drop it in the group chat, shout it across the room. Guests join straight from the browser.",
  },
  {
    n: "3",
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
    a: "Nothing. Kali runs entirely in the browser — phone, tablet, laptop, borrowed Chromebook. If it runs a modern browser, it runs Kali.",
  },
  {
    q: "Is my call private?",
    a: "Every call gets its own secret code and everything stays scrambled in transit. Only the host can mute, remove, or end things — guests can just relax.",
  },
  {
    q: "What happens to chat history?",
    a: "Every message is saved as it's sent, so history survives refreshes and re-joins. Ended rooms keep their story; new rooms start fresh.",
  },
  {
    q: "My wifi is terrible. Will Kali cope?",
    a: "That's literally what audio-only mode is for — one tap drops all video and keeps voices crystal clear. Little signal dots show who's struggling before they freeze mid-sentence.",
  },
  {
    q: "How much does it cost?",
    a: "Free while we're little. No tiers, no trials, no credit card ambush. We'll figure out grown-up pricing later and tell you first.",
  },
];

export default async function Home() {
  const { data: session } = await auth.getSession();
  const ctaHref = session?.user ? "/dashboard" : "/auth/sign-up";

  return (
    <div className="flex min-h-screen flex-col bg-kali-pink text-kali-ink dark:bg-kali-ink dark:text-kali-paper">
      {/* Sticky nav */}
      <header className="sticky top-0 z-40 border-b border-kali-ink/10 bg-kali-pink/85 backdrop-blur-lg dark:bg-kali-ink/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <KaliWordmark />
          <nav className="hidden items-center gap-6 text-sm font-bold text-kali-ink/70 md:flex dark:text-kali-paper/70">
            <a href="#features" className="transition-colors hover:text-kali-ink dark:hover:text-kali-paper">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-kali-ink dark:hover:text-kali-paper">
              How it works
            </a>
            <a href="#hosts" className="transition-colors hover:text-kali-ink dark:hover:text-kali-paper">
              For hosts
            </a>
            <a href="#faq" className="transition-colors hover:text-kali-ink dark:hover:text-kali-paper">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/join">
              <Button variant="outline" size="sm" className="border-kali-ink/15 bg-white/70">
                Join a call
              </Button>
            </Link>
            {session?.user ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-up">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-12 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-16">
          <div className="flex flex-col items-start gap-6">
            <h1 className="display-tight animate-fade-up delay-1 text-[2.9rem] leading-[0.98] font-semibold sm:text-6xl lg:text-[4.6rem]">
              Start a call,
              <br />
              no fuss<span className="text-kali-ink">.</span>
            </h1>
            <p className="animate-fade-up delay-2 max-w-md text-lg leading-relaxed text-kali-ink/75 dark:text-kali-paper/75">
              Kali is the video app that skips the boring parts. Instant rooms, guest links, live
              chat that saves itself — free while we&apos;re little.
            </p>
            <div className="animate-fade-up delay-3 flex flex-wrap gap-3">
              <Link href={ctaHref}>
                <Button variant="primary" size="lg">
                  {session?.user ? "Go to dashboard" : "Start a free call"}{" "}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="outline" size="lg" className="border-kali-ink/15 bg-white">
                  Join with a code
                </Button>
              </Link>
            </div>
            <div className="animate-fade-up delay-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-kali-ink/65">
              {["Free, no card", "No downloads", "Guests need no account"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4" weight="bold" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Product mock */}
          <div className="animate-fade-up delay-2 relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[28px] bg-kali-ink p-4 shadow-2xl">
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-kali-pink" />
                <span className="ml-2 rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-bold text-white/70">
                  kali — friday gossip session
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <MockTile name="Ada (you)" color="bg-kali-pink text-kali-ink" speaking />
                <MockTile name="Grace" color="bg-white/15 text-white" />
                <MockTile name="Hedy" color="bg-white/15 text-white" muted />
                <MockTile name="Katherine 🖥" color="bg-white/15 text-white" />
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                  <Microphone className="h-4 w-4" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                  <VideoCamera className="h-4 w-4" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                  <MonitorArrowUp className="h-4 w-4" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kali-danger text-white">
                  <PhoneDisconnect className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div
              className="animate-float absolute -top-5 -right-3 rounded-2xl bg-white px-4 py-3 shadow-xl"
              style={{ "--float-rot": "3deg" } as React.CSSProperties}
            >
              <p className="text-xs font-semibold text-kali-ink">Grace</p>
              <p className="text-xs text-kali-ink/60">wait, you&apos;re muted 😭</p>
            </div>
            <div
              className="animate-float absolute -bottom-5 -left-3 rounded-2xl bg-kali-ink px-4 py-3 shadow-xl"
              style={{ "--float-rot": "-3deg", animationDelay: "1.2s" } as React.CSSProperties}
            >
              <p className="text-xs font-semibold text-white">Link copied!</p>
              <p className="text-xs font-bold text-white/60">kali/m/abc-def-ghi</p>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-kali-ink/20 bg-kali-ink py-3.5">
          <div className="animate-marquee flex w-max gap-8 pr-8">
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-8 text-sm font-semibold tracking-wide whitespace-nowrap text-kali-pink uppercase"
              >
                {t} <span className="text-kali-pink/40">✳</span>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <p className="text-sm font-semibold tracking-widest text-kali-ink/70 uppercase dark:text-kali-paper/70">
            Why Kali
          </p>
          <h2 className="display-tight mt-2 max-w-xl text-4xl font-semibold sm:text-5xl">
            Everything you need. None of the blah<span className="text-kali-ink">.</span>
          </h2>
          <p className="mt-3 max-w-lg text-lg text-kali-ink/70 dark:text-kali-paper/70">
            Built for friend groups, study sessions, standups and long-distance gossip — not board
            meetings.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="kali-lift rounded-[28px] bg-white p-7">
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.tile}`}
                >
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-kali-ink">
                  {f.title}
                </h3>
                <p className="mt-1.5 leading-relaxed text-kali-ink/65">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 bg-kali-ink text-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-24">
            <p className="text-sm font-semibold tracking-widest text-kali-pink uppercase">
              How it works
            </p>
            <h2 className="display-tight mt-2 max-w-xl text-4xl font-semibold sm:text-5xl">
              Live in three tiny steps<span className="text-kali-pink">.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <article key={s.n} className="rounded-[28px] bg-kali-pink p-7 text-kali-ink">
                  <p className="display-tight text-5xl font-semibold text-kali-ink">{s.n}</p>
                  <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-kali-ink/70">{s.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ctaHref}>
                <Button variant="secondary" size="lg">
                  Try step one now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/join">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  I have a code
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Hosts / trust */}
        <section id="hosts" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-widest text-kali-ink/70 uppercase dark:text-kali-paper/70">
                For hosts
              </p>
              <h2 className="display-tight mt-2 text-4xl font-semibold sm:text-5xl">
                You&apos;re the host. Act like it<span className="text-kali-ink">.</span>
              </h2>
              <p className="mt-3 max-w-md text-lg text-kali-ink/70 dark:text-kali-paper/70">
                Real host powers that always work — no fine print, no funny business.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Mute any mic mid-sentence (lovingly)",
                  "Remove anyone, instantly",
                  "End the whole call for everyone",
                  "See who's struggling with live connection dots",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 font-bold">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kali-ink">
                      <Check className="h-4 w-4 text-kali-pink" weight="bold" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] bg-white p-7 sm:p-9">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-kali-ink text-kali-pink">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-kali-ink">
                Good to know
              </h3>
              <dl className="mt-4 flex flex-col gap-3">
                {[
                  ["Calls", "Video and voice run on fast servers around the world, so calls stay smooth."],
                  ["Memory", "Your rooms and chats are saved for you — pick up right where you left off."],
                  ["Safety", "Only the host can mute, remove, or end a call. Guests can just relax."],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-kali-pink-pale/70 px-5 py-4">
                    <dt className="inline-block rounded-full bg-kali-ink px-3 py-0.5 text-[11px] font-semibold tracking-widest text-white uppercase">
                      {k}
                    </dt>
                    <dd className="mt-1.5 text-kali-ink/75">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-5 pb-16 lg:pb-24">
          <p className="text-center text-sm font-semibold tracking-widest text-kali-ink/70 uppercase dark:text-kali-paper/70">
            FAQ
          </p>
          <h2 className="display-tight mt-2 text-center text-4xl font-semibold sm:text-5xl">
            Asking for a friend<span className="text-kali-ink">?</span>
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-[24px] bg-white px-6 py-5 text-kali-ink open:bg-kali-ink open:text-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <CaretDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 leading-relaxed text-kali-ink/65 group-open:text-white/70">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <div className="flex flex-col items-center gap-5 rounded-[32px] bg-kali-ink px-8 py-14 text-center text-white sm:py-20">
            <p className="text-sm font-semibold tracking-widest text-kali-pink uppercase">
              Last chance (not really)
            </p>
            <h2 className="display-tight max-w-2xl text-4xl font-semibold sm:text-6xl">
              Your next call could take ten seconds to start.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={ctaHref}>
                <Button variant="secondary" size="lg">
                  {session?.user ? "Open your dashboard" : "Make your first room"}{" "}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/join">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Join as a guest
                </Button>
              </Link>
            </div>
            <p className="text-sm font-bold text-white/50">
              Hosting needs a free account. Joining just needs a name.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-kali-ink/15">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <KaliWordmark />
          <p className="text-sm font-semibold text-kali-ink/60 dark:text-kali-paper/60">
            Made with care by Kali. Be kind on calls.
          </p>
          <div className="flex gap-5 text-sm font-bold text-kali-ink/75 dark:text-kali-paper/75">
            <Link href="/join" className="hover:underline">
              Join
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/auth/sign-up" className="hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MockTile({
  name,
  color,
  speaking,
  muted,
}: {
  name: string;
  color: string;
  speaking?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`relative flex aspect-video items-center justify-center rounded-2xl ${color} ${speaking ? "kali-speaking" : ""}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-sm font-semibold">
        {name[0]}
      </span>
      <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
        {name}
      </span>
      {muted && (
        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-kali-danger p-1 text-white">
          <Microphone className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );
}

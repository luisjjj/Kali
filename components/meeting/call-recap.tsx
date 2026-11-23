import Link from "next/link";
import { ChatCircleText, Clock, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { StartYourOwnCall } from "@/components/join/host-cta";
import { Doodles } from "@/components/ui/doodles";
import { RecapCopyLink } from "@/components/meeting/recap-copy-link";
import { formatCallDuration, formatRecapDate, formatRecapTime } from "@/lib/recap";

export type RecapParticipant = { name: string; role: string };
export type RecapMessage = {
  id: string;
  senderName: string;
  body: string;
  createdAt: Date;
};

export function CallRecap({
  roomCode,
  title,
  endedAt,
  durationMs,
  participants,
  messages,
}: {
  roomCode: string;
  title: string;
  endedAt: Date;
  durationMs: number | null;
  participants: RecapParticipant[];
  messages: RecapMessage[];
}) {
  const stats = [
    { label: "Length", value: durationMs ? formatCallDuration(durationMs) : "Unknown", icon: Clock },
    {
      label: "People",
      value: participants.length ? String(participants.length) : "Unknown",
      icon: UsersThree,
    },
    { label: "Messages", value: String(messages.length), icon: ChatCircleText },
  ];

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <Doodles className="-z-10" />

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <Link href="/">
          <Button variant="ghost" size="sm">
            Home
          </Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 pb-16">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-kali-muted uppercase">
            <span className="h-px w-6 bg-kali-accent" aria-hidden />
            Call recap
          </p>
          <h1 className="display-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-kali-muted">
            Ended {formatRecapDate(endedAt)} at {formatRecapTime(endedAt)} WAT · kali/m/{roomCode}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }, index) => (
            <div
              key={label}
              className={`kali-card flex flex-col gap-2 px-4 py-4 ${
                index === 0 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <Icon className="h-4.5 w-4.5 text-kali-muted" weight="bold" />
              <div>
                <p className="text-lg leading-tight font-semibold">{value}</p>
                <p className="text-[11px] font-semibold tracking-wider text-kali-muted uppercase">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="kali-card flex flex-col gap-3 px-5 py-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <UsersThree className="h-4 w-4 text-kali-muted" weight="bold" />
            Who was here
          </h2>
          {participants.length === 0 ? (
            <p className="text-sm text-kali-muted">Nobody was recorded for this call.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {participants.map((person) => (
                <li
                  key={person.name}
                  className="flex items-center gap-2 rounded-full border border-line bg-[var(--surface-muted)] py-1 pr-3 pl-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-semibold text-foreground">
                    {person.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{person.name}</span>
                  {person.role === "host" && (
                    <span className="text-[10px] font-bold tracking-wider text-kali-muted uppercase">
                      Host
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="kali-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ChatCircleText className="h-4 w-4 text-kali-muted" weight="bold" />
              Saved chat
            </h2>
            <span className="text-xs font-semibold text-kali-muted">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>
          {messages.length === 0 ? (
            <p className="px-5 py-8 text-sm text-kali-muted">
              No messages were sent in this call.
            </p>
          ) : (
            <ul className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto px-5 py-4">
              {messages.map((message) => (
                <li key={message.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">{message.senderName}</span>
                    <time
                      dateTime={message.createdAt.toISOString()}
                      className="shrink-0 text-[11px] font-medium text-kali-muted"
                    >
                      {formatRecapTime(message.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground/80">
                    {message.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <RecapCopyLink roomCode={roomCode} />
          <StartYourOwnCall variant="primary" size="md" />
        </div>
      </main>
    </div>
  );
}

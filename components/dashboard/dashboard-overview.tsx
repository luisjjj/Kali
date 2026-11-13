"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarBlank,
  Check,
  Copy,
  Plus,
  SignIn,
  Timer,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SchedulePicker } from "@/components/dashboard/schedule-picker";
import { ShareWhatsApp } from "@/components/meeting/share-whatsapp";
import {
  isRoomId,
  looksLikeCompactRoomCode,
  normalizeRoomId,
  slugifyRoomName,
} from "@/lib/room-code";
import type { Meeting } from "@/lib/db/schema";

type Mode = "instant" | "scheduled";

export function DashboardOverview({
  upcoming,
  past,
  userName,
}: {
  upcoming: Meeting[];
  past: Meeting[];
  userName: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("instant");
  const [title, setTitle] = useState("");
  const [roomName, setRoomName] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const openDialog = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (busy) return;
    setDialogOpen(false);
    setError(null);
  };

  const create = async (kind: Mode, skipName = false) => {
    const cleanRoomName = skipName ? "" : roomName.trim();
    const customRoom = cleanRoomName ? slugifyRoomName(cleanRoomName) : "";
    if (
      cleanRoomName &&
      (!customRoom || !isRoomId(customRoom) || looksLikeCompactRoomCode(customRoom))
    ) {
      setError("Room names use lowercase letters, numbers, or dashes (like study-gang).");
      return;
    }
    if (kind === "scheduled" && (!scheduledAt || scheduledAt.getTime() <= Date.now())) {
      setError("Pick a date and time in the future.");
      return;
    }

    setBusy(kind);
    setError(null);
    setSavedNote(null);
    const guessTitle = title.trim() || (kind === "instant" ? "Quick catch-up" : "Scheduled call");
    // Optimistic row: the list reacts instantly, the server catches up.
    setOptimistic({
      id: `temp-${kind}-${Date.now()}`,
      hostUserId: "",
      title: guessTitle,
      roomCode: customRoom || "···",
      scheduledAt: kind === "scheduled" && scheduledAt ? scheduledAt : null,
      createdAt: new Date(),
      endedAt: null,
    });
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: guessTitle,
          roomName: cleanRoomName || null,
          scheduledAt: kind === "scheduled" && scheduledAt ? scheduledAt.toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the meeting.");
      if (kind === "instant") {
        router.push(`/m/${data.meeting.roomCode}`);
        return;
      }
      setTitle("");
      setRoomName("");
      setScheduledAt(null);
      setBusy(null);
      setOptimistic(null);
      setDialogOpen(false);
      const when = data.meeting.scheduledAt
        ? new Date(data.meeting.scheduledAt).toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })
        : "anytime";
      setSavedNote(`Saved for ${when}. See you then.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the meeting.");
      setBusy(null);
      setOptimistic(null);
    }
  };

  const join = () => {
    const code = normalizeRoomId(joinCode);
    if (!isRoomId(code)) {
      setJoinError("That room name doesn't look right. Try study-gang or abc-def-ghi.");
      return;
    }
    setJoinError(null);
    router.push(`/m/${code}`);
  };

  const copy = async (roomCode: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${roomCode}`);
      setCopied(roomCode);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const initial = (userName.trim()[0] ?? "?").toUpperCase();
  const roomPreview = roomName.trim() ? slugifyRoomName(roomName) : "";
  const scheduleInvalid = mode === "scheduled" && scheduledAt === null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-semibold text-foreground">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider text-kali-muted uppercase">Dashboard</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              Good to see you, {userName}.
            </h1>
            <p className="mt-1 text-sm text-kali-muted">
              Start a room in seconds. Guests only need the link.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openDialog("scheduled")}>
            <CalendarBlank className="h-4 w-4" /> Schedule
          </Button>
          <Button onClick={() => openDialog("instant")}>
            <Plus className="h-4 w-4" weight="bold" /> New meeting
          </Button>
        </div>
      </header>

      {savedNote && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-kali-success/25 bg-kali-success/10 px-4 py-3 text-sm font-semibold text-kali-success"
        >
          <Check className="h-4 w-4 shrink-0" weight="bold" /> {savedNote}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              Upcoming <Badge tone="pink">{upcoming.length}</Badge>
            </h2>
          </div>

          <div className="kali-card overflow-hidden">
            {upcoming.length === 0 && !optimistic && (
              <div className="flex flex-col items-start gap-2 px-6 py-10">
                <p className="font-semibold">Nothing lined up</p>
                <p className="max-w-sm text-sm text-kali-muted">
                  Start a room above and share the link. Guests join without an account.
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => openDialog("instant")}>
                  Start a meeting
                </Button>
              </div>
            )}

            {optimistic && (
              <div className="flex animate-pulse items-center gap-3 border-b border-line px-5 py-4 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{optimistic.title}</p>
                  <p className="mt-0.5 text-xs text-kali-muted">Saving…</p>
                </div>
              </div>
            )}

            {upcoming.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-kali-muted">
                    <span className="truncate font-medium text-foreground/75">kali/m/{m.roomCode}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Anytime"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copy(m.roomCode)}
                    aria-label={`Copy link for ${m.title}`}
                    className="kali-press kali-focus rounded-full p-2 text-kali-muted hover:bg-[var(--surface-muted)] hover:text-foreground"
                  >
                    {copied === m.roomCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <ShareWhatsApp
                    roomCode={m.roomCode}
                    title={m.title}
                    showLabel={false}
                    className="!h-8 !w-8 !px-0"
                  />
                  <Button variant="outline" size="sm" onClick={() => router.push(`/m/${m.roomCode}`)}>
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kali-pink-pale text-foreground">
                <SignIn className="h-4 w-4" weight="bold" />
              </span>
              <h2 className="text-base font-semibold">Join a call</h2>
            </div>
            <p className="mt-2 text-sm text-kali-muted">Have a link, name, or code? Jump in.</p>
            <form
              className="mt-4 flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                join();
              }}
            >
              <Label htmlFor="joinCode" className="sr-only">
                Room name or code
              </Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  if (joinError) setJoinError(null);
                }}
                onBlur={() => setJoinCode(normalizeRoomId(joinCode))}
                placeholder="study-gang or xxx-xxx-xxx"
                autoCapitalize="none"
                spellCheck={false}
              />
              <Button type="submit" variant="outline" className="w-full">
                Join room
              </Button>
            </form>
            {joinError && (
              <p role="alert" className="mt-3 text-xs font-semibold text-kali-danger">
                {joinError}
              </p>
            )}
          </Card>

          <Card className="bg-[var(--surface-muted)] shadow-none">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-kali-muted uppercase">
              <Timer className="h-4 w-4 text-kali-pink" weight="bold" /> Call window
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              Rooms run for up to an hour. You get a five minute heads up before the room closes
              itself.
            </p>
          </Card>
        </aside>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 px-1 text-base font-semibold">
          Past <Badge tone="ink">{past.length}</Badge>
        </h2>
        <div className="kali-card overflow-hidden">
          {past.length === 0 ? (
            <p className="px-6 py-8 text-sm text-kali-muted">Finished calls will show up here.</p>
          ) : (
            past.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/80">{m.title}</p>
                  <p className="mt-0.5 text-xs text-kali-muted">
                    kali/m/{m.roomCode}
                    {m.endedAt ? ` · ended ${new Date(m.endedAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <Badge tone="ink">Ended</Badge>
              </div>
            ))
          )}
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={mode === "instant" ? "New meeting" : "Schedule a meeting"}
        description={
          mode === "instant"
            ? "Name your room, or skip and let Kali pick a random link."
            : "Pick a time and a room name. Guests join straight from the link."
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog} disabled={busy !== null}>
              Cancel
            </Button>
            {mode === "instant" && (
              <Button variant="outline" onClick={() => create("instant", true)} disabled={busy !== null}>
                Skip naming
              </Button>
            )}
            <Button onClick={() => create(mode)} disabled={busy !== null || scheduleInvalid}>
              {busy === "instant" && "Starting…"}
              {busy === "scheduled" && "Scheduling…"}
              {!busy && mode === "instant" && (
                <>
                  Start meeting <ArrowRight className="h-4 w-4" />
                </>
              )}
              {!busy && mode === "scheduled" && "Schedule call"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div
            role="tablist"
            aria-label="Meeting type"
            className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-[var(--surface-muted)] p-1"
          >
            {([
              ["instant", "Start now"],
              ["scheduled", "Schedule"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className={
                  mode === value
                    ? "rounded-lg bg-surface px-3 py-2 text-sm font-semibold shadow-sm"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-kali-muted hover:text-foreground"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <Field>
            <Label htmlFor="meetingTitle">Call title</Label>
            <Input
              id="meetingTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Friday catch-up"
              maxLength={120}
            />
            <p className="text-xs text-kali-muted">Optional. Defaults to Quick catch-up.</p>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor="meetingRoom">Room name</Label>
              <span className="text-xs font-medium text-kali-muted">Optional</span>
            </div>
            <div className="flex h-11 items-center rounded-xl border border-line bg-surface pl-4 transition-colors focus-within:border-kali-pink">
              <span className="shrink-0 text-sm font-medium text-kali-muted">kali/m/</span>
              <input
                id="meetingRoom"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="study-gang"
                maxLength={40}
                autoCapitalize="none"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent px-2 pr-4 text-sm font-medium text-foreground outline-none placeholder:text-kali-muted/70"
              />
            </div>
            <p className="text-xs text-kali-muted">
              {roomPreview
                ? `Your link will be kali/m/${roomPreview}.`
                : "Leave blank to get a random code."}
            </p>
          </Field>

          {mode === "scheduled" && (
            <Field>
              <Label>Date and time</Label>
              <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />
            </Field>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-kali-danger/10 px-4 py-3 text-sm font-semibold text-kali-danger">
              {error}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Copy, Check, Plus, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Field, Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import type { Meeting } from "@/lib/db/schema";

export function DashboardClient({
  upcoming,
  past,
  userName,
}: {
  upcoming: Meeting[];
  past: Meeting[];
  userName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const create = async (kind: "instant" | "scheduled") => {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || (kind === "instant" ? "Quick catch-up" : "Scheduled call"),
          scheduledAt: kind === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the meeting.");
      router.push(`/m/${data.meeting.roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the meeting.");
      setBusy(null);
    }
  };

  const join = () => {
    const code = joinCode.trim().toLowerCase();
    if (!/^[a-z2-9]{3}-[a-z2-9]{3}-[a-z2-9]{3}$/.test(code)) {
      setError("That code doesn't look right. Try xxx-xxx-xxx.");
      return;
    }
    router.push(`/m/${code}`);
  };

  const copy = async (roomCode: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${roomCode}`);
      setCopied(roomCode);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[32px] bg-kali-ink p-8 text-white sm:p-10">
        <p className="font-bold text-white/60">Hey, {userName}! 👋</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready when you are.
        </h1>
        <Field className="mt-5 max-w-md">
          <Label htmlFor="mtitle" className="text-white/80">
            Call title
          </Label>
          <Input
            id="mtitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Friday gossip session"
            maxLength={120}
            className="border-0"
          />
        </Field>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" size="md" disabled={busy !== null} onClick={() => create("instant")}>
            <Plus /> {busy === "instant" ? "Making…" : "New meeting"}
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pr-1 pl-4">
            <CalendarPlus className="h-5 w-5 shrink-0" />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              aria-label="Schedule for"
              className="w-44 bg-transparent text-sm font-bold text-white outline-none [color-scheme:dark]"
            />
            <Button variant="secondary" size="sm" disabled={busy !== null || !scheduledAt} onClick={() => create("scheduled")}>
              {busy === "scheduled" ? "…" : "Schedule"}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex max-w-md items-center gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Have a code? xxx-xxx-xxx"
            onKeyDown={(e) => {
              if (e.key === "Enter") join();
            }}
            className="border-0"
          />
          <Button variant="secondary" size="md" onClick={join}>
            <LogIn /> Join
          </Button>
        </div>
        {error && (
          <p className="mt-3 max-w-md rounded-2xl bg-kali-danger px-4 py-3 text-sm font-bold text-white">
            {error}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="px-1 text-lg font-bold">
            Upcoming <Badge tone="pink">{upcoming.length}</Badge>
          </h2>
          {upcoming.length === 0 && (
            <EmptyState title="Nothing lined up" body="Hit “New meeting” and make something happen." />
          )}
          {upcoming.map((m) => (
            <Card key={m.id} className="flex items-center gap-3 !p-5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{m.title}</p>
                <p className="text-sm font-semibold text-kali-muted">
                  {m.roomCode}
                  {m.scheduledAt ? ` · ${new Date(m.scheduledAt).toLocaleString()}` : " · anytime"}
                </p>
              </div>
              <button
                onClick={() => copy(m.roomCode)}
                aria-label="Copy link"
                className="kali-press rounded-full bg-kali-pink-pale p-2.5"
              >
                {copied === m.roomCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <Button variant="primary" size="sm" onClick={() => router.push(`/m/${m.roomCode}`)}>
                Open
              </Button>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="px-1 text-lg font-bold">
            Past <Badge tone="ink">{past.length}</Badge>
          </h2>
          {past.length === 0 && (
            <Card>
              <CardTitle>No history yet</CardTitle>
              <CardText>Finished calls will chill here.</CardText>
            </Card>
          )}
          {past.map((m) => (
            <Card key={m.id} className="!p-5 opacity-75">
              <p className="truncate font-bold">{m.title}</p>
              <p className="text-sm font-semibold text-kali-muted">
                {m.roomCode} · ended{" "}
                {m.endedAt ? new Date(m.endedAt).toLocaleString() : "a while ago"}
              </p>
            </Card>
          ))}
          {past.length > 0 && (
            <p className="flex items-center gap-1.5 px-1 text-xs font-bold text-kali-muted">
              <Trash2 className="h-3 w-3" /> Ended rooms stay read-only. Make a new one anytime.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

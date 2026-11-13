"use client";

import { useState } from "react";
import { useLocalParticipant, useParticipants } from "@livekit/components-react";
import { Crown, MicrophoneSlash, X, UserMinus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

function prettyName(p: { name?: string; identity: string }) {
  return p.name || p.identity.replace(/^(user-|guest-)/, "") || "Someone";
}

export function ParticipantsPanel({
  roomCode,
  isHost,
  onClose,
}: {
  roomCode: string;
  isHost: boolean;
  onClose: () => void;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const act = async (path: "mute" | "remove", identity: string) => {
    setBusy(identity + path);
    setNotice(null);
    try {
      const res = await fetch(`/api/livekit/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, identity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Didn't work. Try again.");
      setNotice(path === "mute" ? "Muted them." : "They've been removed.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface sm:w-80 sm:shrink-0 max-sm:fixed max-sm:inset-x-4 max-sm:top-24 max-sm:bottom-36 max-sm:z-30 max-sm:w-auto max-sm:shadow-2xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">People ({participants.length})</h2>
        <button
          onClick={onClose}
          aria-label="Close participants"
          className="kali-press rounded-md p-1.5 text-kali-muted hover:bg-[var(--surface-muted)] hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
        {notice && (
          <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-kali-muted">
            {notice}
          </p>
        )}
        {participants.map((p) => {
          const mine = p.identity === localParticipant?.identity;
          const name = prettyName(p);
          return (
            <div
              key={p.identity}
              className="flex items-center gap-3 rounded-xl border border-line bg-[var(--surface-muted)] px-3 py-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kali-pink text-sm font-semibold text-white">
                {(name[0] ?? "?").toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {name} {mine ? "(you)" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-kali-muted">
                  {!p.isMicrophoneEnabled && (
                    <span className="inline-flex items-center gap-0.5">
                      <MicrophoneSlash className="h-3 w-3" /> muted
                    </span>
                  )}
                  {p.isSpeaking && <span className="text-kali-success">● speaking</span>}
                </span>
              </div>
              {isHost && !mine && (
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => act("mute", p.identity)}
                    disabled={busy !== null}
                    title={`Mute ${name}`}
                    aria-label={`Mute ${name}`}
                    className="kali-press rounded-md border border-line bg-surface p-1.5 text-foreground hover:bg-[var(--surface-muted)] disabled:opacity-40"
                  >
                    <MicrophoneSlash className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => act("remove", p.identity)}
                    disabled={busy !== null}
                    title={`Remove ${name}`}
                    aria-label={`Remove ${name}`}
                    className="kali-press rounded-md bg-kali-danger/10 p-1.5 text-kali-danger disabled:opacity-40"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {isHost && (
          <p className="flex items-center gap-1.5 px-1 pt-1 text-[11px] font-medium text-kali-muted">
            <Crown className="h-3 w-3" /> You&apos;re the host. <Badge tone="pink">mute</Badge> and
            remove away.
          </p>
        )}
      </div>
    </aside>
  );
}

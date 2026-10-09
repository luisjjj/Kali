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
      setNotice(path === "mute" ? "Muted them. Shh. 🤫" : "They've been removed.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Didn't work. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-[24px] bg-white sm:w-80 sm:shrink-0 dark:bg-white/5">
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="font-bold">People ({participants.length})</h2>
        <button
          onClick={onClose}
          aria-label="Close participants"
          className="kali-press rounded-full bg-kali-pink-pale p-2 text-kali-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
        {notice && (
          <p className="rounded-2xl bg-kali-pink-pale/70 px-4 py-2 text-xs font-bold text-kali-ink dark:bg-white/10 dark:text-kali-paper">
            {notice}
          </p>
        )}
        {participants.map((p) => {
          const mine = p.identity === localParticipant?.identity;
          const name = prettyName(p);
          return (
            <div
              key={p.identity}
              className="flex items-center gap-3 rounded-2xl bg-kali-pink-pale/50 px-3 py-2.5 text-kali-ink dark:bg-white/10 dark:text-kali-paper"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kali-pink text-sm font-bold text-kali-ink">
                {(name[0] ?? "?").toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-bold">
                  {name} {mine ? "(you)" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-kali-ink/60 dark:text-kali-paper/60">
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
                    className="kali-press rounded-full bg-white p-2 text-kali-ink disabled:opacity-40"
                  >
                    <MicrophoneSlash className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => act("remove", p.identity)}
                    disabled={busy !== null}
                    title={`Remove ${name}`}
                    aria-label={`Remove ${name}`}
                    className="kali-press rounded-full bg-kali-danger/10 p-2 text-kali-danger disabled:opacity-40"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {isHost && (
          <p className="flex items-center gap-1.5 px-1 pt-1 text-[11px] font-bold text-kali-ink/60 dark:text-kali-paper/60">
            <Crown className="h-3 w-3" /> You&apos;re the host — <Badge tone="pink">mute</Badge> and
            remove away.
          </p>
        )}
      </div>
    </aside>
  );
}

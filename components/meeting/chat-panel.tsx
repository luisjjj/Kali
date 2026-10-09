"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat, useLocalParticipant } from "@livekit/components-react";
import { SendHorizonal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryMessage {
  id: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export function ChatPanel({
  roomCode,
  displayName,
  onClose,
  onMessage,
}: {
  roomCode: string;
  displayName: string;
  onClose: () => void;
  onMessage: () => void;
}) {
  const { chatMessages, send } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const mountTime = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  // Load persisted history once (survives refresh).
  useEffect(() => {
    let alive = true;
    fetch(`/api/meetings/${roomCode}/messages`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.messages)) setHistory(d.messages);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [roomCode]);

  // Live messages only (arrived after mount — avoids dupes with history).
  const live = chatMessages.filter((m) => m.timestamp > mountTime.current);

  // Notify parent of incoming messages for the unread badge.
  const lastTs = live.length > 0 ? live[live.length - 1].timestamp : 0;
  const lastFrom = live.length > 0 ? live[live.length - 1].from?.identity : "";
  useEffect(() => {
    if (lastTs > 0 && lastFrom !== localParticipant?.identity) {
      onMessageRef.current();
    }
  }, [lastTs, lastFrom, localParticipant?.identity]);

  // Auto-scroll on new content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, live.length]);

  const sendMessage = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await send(body);
    } catch {
      // Live delivery failed — history persist below still saves it.
    }
    try {
      await fetch(`/api/meetings/${roomCode}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName: displayName, body }),
      });
    } catch {}
    setDraft("");
    setSending(false);
  }, [draft, sending, send, roomCode, displayName]);

  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-[24px] bg-white sm:w-80 sm:shrink-0 dark:bg-white/5">
      <div className="flex items-center justify-between px-5 py-3">
        <h2 className="font-bold">Chat</h2>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="kali-press rounded-full bg-kali-pink-pale p-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
        {history.length === 0 && live.length === 0 && (
          <p className="rounded-2xl bg-kali-pink-pale/60 px-4 py-6 text-center text-sm font-semibold text-kali-muted">
            No messages yet. Say hi — it saves here automatically. 💬
          </p>
        )}
        {history.map((m) => (
          <Bubble key={m.id} name={m.senderName} body={m.body} mine={m.senderName === displayName} />
        ))}
        {live.map((m, i) => (
          <Bubble
            key={`${m.timestamp}-${i}`}
            name={m.from?.name ?? "Someone"}
            body={m.message}
            mine={!!m.from?.isLocal}
          />
        ))}
      </div>

      <div className="flex gap-2 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type something sweet…"
          maxLength={2000}
          className="kali-focus h-11 min-w-0 flex-1 rounded-full bg-kali-pink-pale/60 px-4 text-sm font-medium placeholder:text-kali-muted"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !draft.trim()}
          aria-label="Send message"
          className="kali-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kali-ink text-white disabled:opacity-40"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}

function Bubble({ name, body, mine }: { name: string; body: string; mine: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
      <span className="px-1 text-[11px] font-bold text-kali-muted">{name}</span>
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed font-medium break-words",
          mine ? "rounded-br-md bg-kali-pink text-kali-ink" : "rounded-bl-md bg-kali-pink-pale/70"
        )}
      >
        {body}
      </p>
    </div>
  );
}

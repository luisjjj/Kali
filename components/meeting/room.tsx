"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  VideoTrack,
  ConnectionQualityIndicator,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  MessageCircle,
  Users,
  PhoneOff,
  Gauge,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import type { JoinResult } from "./lobby";
import { ChatPanel } from "./chat-panel";
import { ParticipantsPanel } from "./participants-panel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MeetingRoom({
  roomCode,
  title,
  join,
  displayName,
  isHost,
  startMicOn,
  startCamOn,
  onLeft,
  onEnded,
}: {
  roomCode: string;
  title: string;
  join: JoinResult;
  displayName: string;
  isHost: boolean;
  startMicOn: boolean;
  startCamOn: boolean;
  onLeft: () => void;
  onEnded: () => void;
  onRejoin: () => void;
}) {
  return (
    <LiveKitRoom
      token={join.token}
      serverUrl={join.serverUrl}
      connect
      audio={startMicOn}
      video={startCamOn}
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: { simulcast: true },
      }}
    >
      <RoomShell
        roomCode={roomCode}
        title={title}
        displayName={displayName || join.identity}
        isHost={isHost}
        onLeft={onLeft}
        onEnded={onEnded}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function RoomShell({
  roomCode,
  title,
  displayName,
  isHost,
  onLeft,
  onEnded,
}: {
  roomCode: string;
  title: string;
  displayName: string;
  isHost: boolean;
  onLeft: () => void;
  onEnded: () => void;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [chatOpen, setChatOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unread, setUnread] = useState(0);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const prevCam = useRef<boolean | null>(null);

  // Ended polling: if the host ends the meeting, everyone lands on the ended screen.
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch(`/api/meetings/${roomCode}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data.meeting?.endedAt) {
          try {
            await room.disconnect();
          } catch {}
          onEnded();
        }
      } catch {}
    };
    const t = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [roomCode, room, onEnded]);

  // Unexpected disconnect (kicked / network / host ended room): check status, route accordingly.
  useEffect(() => {
    const onDc = async () => {
      try {
        const res = await fetch(`/api/meetings/${roomCode}`);
        const data = await res.json();
        if (data.meeting?.endedAt) onEnded();
        else onLeft();
      } catch {
        onLeft();
      }
    };
    room.on(RoomEvent.Disconnected, onDc);
    return () => {
      room.off(RoomEvent.Disconnected, onDc);
    };
  }, [room, roomCode, onEnded, onLeft]);

  // Low-bandwidth mode: drop video, keep audio.
  useEffect(() => {
    if (!room) return;
    if (lowBandwidth) {
      prevCam.current = localParticipant?.isCameraEnabled ?? null;
      localParticipant?.setCameraEnabled(false).catch(() => {});
      room.remoteParticipants.forEach((p) => {
        p.videoTrackPublications.forEach((pub) => {
          pub.setSubscribed(false);
        });
      });
    } else if (prevCam.current !== null) {
      if (prevCam.current) localParticipant?.setCameraEnabled(true).catch(() => {});
      room.remoteParticipants.forEach((p) => {
        p.videoTrackPublications.forEach((pub) => {
          pub.setSubscribed(true);
        });
      });
      prevCam.current = null;
    }
  }, [lowBandwidth, room, localParticipant]);

  const leave = useCallback(async () => {
    try {
      await room.disconnect();
    } catch {}
    onLeft();
  }, [room, onLeft]);

  const endForAll = useCallback(async () => {
    if (!confirm("End this call for everyone?")) return;
    try {
      await fetch(`/api/meetings/${roomCode}/end`, { method: "POST" });
    } catch {}
    try {
      await room.disconnect();
    } catch {}
    onEnded();
  }, [roomCode, room, onEnded]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${roomCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [roomCode]);

  const trackRefs = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: true }
  );
  const screens = trackRefs.filter((t) => t.source === Track.Source.ScreenShare);

  const micOn = localParticipant?.isMicrophoneEnabled ?? true;
  const camOn = localParticipant?.isCameraEnabled ?? true;
  const sharing = localParticipant?.isScreenShareEnabled ?? false;

  return (
    <div className="flex h-dvh flex-col bg-kali-paper dark:bg-black">
      <header className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-lg font-extrabold tracking-tight">{title}</span>
          <Badge tone="pink" className="hidden sm:inline-flex">
            {roomCode}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="kali-press flex items-center gap-1.5 rounded-full bg-kali-pink-pale px-4 py-2 text-sm font-bold"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={() => setLowBandwidth((v) => !v)}
            title="Low-bandwidth mode: audio only"
            className={cn(
              "kali-press flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold",
              lowBandwidth ? "bg-kali-ink text-white" : "bg-kali-pink-pale"
            )}
          >
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">{lowBandwidth ? "Audio only" : "Full video"}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 px-4 pb-3 sm:px-6">
        <main className="flex min-h-0 flex-1 flex-col">
          {lowBandwidth && (
            <p className="mb-2 rounded-2xl bg-kali-ink px-4 py-2 text-center text-xs font-bold text-white">
              Audio-only mode is on — video is paused to save bandwidth.
            </p>
          )}
          <div
            className={cn(
              "grid min-h-0 flex-1 content-center gap-3 overflow-y-auto",
              screens.length > 0
                ? "grid-cols-1"
                : participants.length <= 1
                  ? "grid-cols-1"
                  : participants.length <= 4
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 lg:grid-cols-3"
            )}
          >
            {participants.map((p) => (
              <ParticipantCard
                key={p.identity}
                participantSid={p.sid}
                lowBandwidth={lowBandwidth}
              />
            ))}
          </div>
        </main>

        <div className={cn(chatOpen ? "contents" : "hidden")}>
          <ChatPanel
            roomCode={roomCode}
            displayName={displayName}
            onClose={() => setChatOpen(false)}
            onMessage={() => {
              if (!chatOpenRef.current) setUnread((u) => u + 1);
            }}
          />
        </div>
        {peopleOpen && !chatOpen && (
          <ParticipantsPanel
            roomCode={roomCode}
            isHost={isHost}
            onClose={() => setPeopleOpen(false)}
          />
        )}
      </div>

      <footer className="flex justify-center px-4 pt-1 pb-5">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1.5 rounded-full bg-kali-ink px-3 py-2.5 text-white shadow-xl sm:gap-2 sm:px-4"
        >
          <CtrlButton
            active={micOn}
            onClick={() => localParticipant?.setMicrophoneEnabled(!micOn)}
            label={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </CtrlButton>
          <CtrlButton
            active={camOn}
            onClick={() => localParticipant?.setCameraEnabled(!camOn)}
            label={camOn ? "Camera off" : "Camera on"}
          >
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </CtrlButton>
          <CtrlButton
            active={!sharing}
            onClick={() => localParticipant?.setScreenShareEnabled(!sharing)}
            label={sharing ? "Stop share" : "Share screen"}
          >
            {sharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
          </CtrlButton>
          <CtrlButton
            active
            onClick={() => {
              setChatOpen((v) => !v);
              setPeopleOpen(false);
              setUnread(0);
            }}
            label="Chat"
            badge={unread > 0 && !chatOpen ? unread : undefined}
          >
            <MessageCircle className="h-5 w-5" />
          </CtrlButton>
          <CtrlButton
            active
            onClick={() => {
              setPeopleOpen((v) => !v);
              setChatOpen(false);
            }}
            label="People"
          >
            <Users className="h-5 w-5" />
          </CtrlButton>
          {isHost && (
            <button
              onClick={endForAll}
              title="End for everyone"
              className="kali-press hidden rounded-full bg-kali-danger px-4 py-2.5 text-sm font-bold text-white sm:block"
            >
              End
            </button>
          )}
          <button
            onClick={leave}
            title="Leave"
            className="kali-press ml-1 flex h-12 w-12 items-center justify-center rounded-full bg-kali-danger text-white"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </motion.div>
      </footer>
    </div>
  );
}

function CtrlButton({
  children,
  onClick,
  label,
  active,
  badge,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active: boolean;
  badge?: number | false;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-full transition-colors",
        active ? "bg-white/15 text-white hover:bg-white/25" : "bg-kali-danger text-white"
      )}
    >
      {children}
      {!!badge && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-kali-pink px-1 text-[11px] font-extrabold text-kali-ink">
          {badge}
        </span>
      )}
    </motion.button>
  );
}

function ParticipantCard({
  participantSid,
  lowBandwidth,
}: {
  participantSid: string;
  lowBandwidth: boolean;
}) {
  const participants = useParticipants();
  const participant = participants.find((p) => p.sid === participantSid);
  const trackRefs = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: true,
  });
  const camRef = trackRefs.find(
    (t) => t.participant.sid === participantSid && t.source === Track.Source.Camera
  );
  const screenRef = trackRefs.find(
    (t) => t.participant.sid === participantSid && t.source === Track.Source.ScreenShare
  );
  const showRef = !lowBandwidth ? (screenRef ?? camRef) : undefined;
  const videoMuted = !showRef || showRef.publication?.isMuted;

  if (!participant) return null;
  const name = participant.name || participant.identity.replace(/^(user-|guest-)/, "");
  const speaking = participant.isSpeaking;
  const isLocal = participant.isLocal;

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[24px] bg-kali-ink transition-shadow duration-300",
        speaking && "kali-speaking"
      )}
    >
      {!videoMuted && showRef ? (
        <VideoTrack trackRef={showRef} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold sm:h-20 sm:w-20 sm:text-2xl",
              isLocal ? "bg-kali-pink text-kali-ink" : "bg-white/15 text-white"
            )}
          >
            {(name[0] ?? "?").toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
        <ConnectionQualityIndicator participant={participant} />
      </div>

      <div className="absolute bottom-2.5 left-2.5 flex max-w-[calc(100%-1.25rem)] items-center gap-1.5">
        <span className="truncate rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {name}
          {isLocal ? " (you)" : ""}
          {screenRef && !lowBandwidth ? " 🖥" : ""}
        </span>
        {!participant.isMicrophoneEnabled && (
          <span className="rounded-full bg-kali-danger p-1.5 text-white">
            <MicOff className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
}

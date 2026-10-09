"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, CameraSlash, Microphone, MicrophoneSlash, CircleNotch } from "@phosphor-icons/react";
import { Room, createLocalTracks, type LocalAudioTrack, type LocalVideoTrack } from "livekit-client";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface JoinResult {
  serverUrl: string;
  token: string;
  identity: string;
  isHost: boolean;
  roomCode: string;
}

interface Device {
  deviceId: string;
  label: string;
}

export function Lobby({
  title,
  roomCode,
  defaultName,
  onJoin,
}: {
  title: string;
  roomCode: string;
  defaultName: string;
  onJoin: (join: JoinResult, media: { micOn: boolean; camOn: boolean }) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioIns, setAudioIns] = useState<Device[]>([]);
  const [videoIns, setVideoIns] = useState<Device[]>([]);
  const [audioId, setAudioId] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const videoEl = useRef<HTMLVideoElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<{ audio: LocalAudioTrack | null; video: LocalVideoTrack | null }>({
    audio: null,
    video: null,
  });

  // Initial preview tracks + device list.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tracks = await createLocalTracks({ audio: true, video: true });
        if (cancelled) {
          tracks.forEach((t) => t.stop());
          return;
        }
        for (const t of tracks) {
          if (t.kind === "audio") {
            tracksRef.current.audio = t as LocalAudioTrack;
            setAudioTrack(t as LocalAudioTrack);
          } else {
            tracksRef.current.video = t as LocalVideoTrack;
            setVideoTrack(t as LocalVideoTrack);
          }
        }
        const [mics, cams] = await Promise.all([
          Room.getLocalDevices("audioinput"),
          Room.getLocalDevices("videoinput"),
        ]);
        if (!cancelled) {
          setAudioIns(mics.map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" })));
          setVideoIns(cams.map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" })));
        }
      } catch {
        if (!cancelled)
          setPreviewError("Couldn't reach your camera or mic. Check permissions — you can still join.");
      }
    })();
    return () => {
      cancelled = true;
      tracksRef.current.audio?.stop();
      tracksRef.current.video?.stop();
    };
  }, []);

  // Attach preview video.
  useEffect(() => {
    const el = videoEl.current;
    if (el && videoTrack && camOn) {
      videoTrack.attach(el);
      return () => {
        videoTrack.detach(el);
      };
    }
  }, [videoTrack, camOn]);

  // Tiny live mic level bar.
  useEffect(() => {
    if (!audioTrack || !micOn) return;
    let raf = 0;
    let ctx: AudioContext | null = null;
    try {
      const stream = new MediaStream([audioTrack.mediaStreamTrack]);
      ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        if (levelRef.current) levelRef.current.style.transform = `scaleX(${Math.min(1, avg * 2.5)})`;
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Meter is decorative — ignore failures.
    }
    return () => {
      cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
    };
  }, [audioTrack, micOn]);

  const toggleMic = useCallback(async () => {
    if (!audioTrack) {
      setMicOn((v) => !v);
      return;
    }
    const next = !micOn;
    setMicOn(next);
    if (next) await audioTrack.unmute();
    else await audioTrack.mute();
  }, [audioTrack, micOn]);

  const toggleCam = useCallback(async () => {
    if (!videoTrack) {
      setCamOn((v) => !v);
      return;
    }
    const next = !camOn;
    setCamOn(next);
    if (next) await videoTrack.unmute();
    else await videoTrack.mute();
  }, [videoTrack, camOn]);

  const switchAudio = useCallback(
    async (deviceId: string) => {
      setAudioId(deviceId);
      const t = tracksRef.current.audio;
      if (t) {
        try {
          await t.restartTrack({ deviceId });
        } catch {
          setPreviewError("Couldn't switch microphone.");
        }
      }
    },
    []
  );

  const switchVideo = useCallback(async (deviceId: string) => {
    setVideoId(deviceId);
    const t = tracksRef.current.video;
    if (t) {
      try {
        await t.restartTrack({ deviceId });
      } catch {
        setPreviewError("Couldn't switch camera.");
      }
    }
  }, []);

  const join = useCallback(async () => {
    const displayName = name.trim();
    if (!displayName) {
      setJoinError("Give yourself a name so friends know it's you.");
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't get you in. Try again.");
      // Stop preview tracks — the room creates its own.
      tracksRef.current.audio?.stop();
      tracksRef.current.video?.stop();
      onJoin(data as JoinResult, { micOn, camOn });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Couldn't get you in. Try again.");
      setJoining(false);
    }
  }, [name, roomCode, micOn, camOn, onJoin]);

  return (
    <div className="flex min-h-screen flex-col bg-kali-paper dark:bg-kali-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <Badge tone="pink">{roomCode}</Badge>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-5 pb-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video overflow-hidden rounded-[24px] bg-kali-ink">
            {camOn && videoTrack ? (
              <video ref={videoEl} className="h-full w-full -scale-x-100 object-cover" muted playsInline />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-kali-pink text-2xl font-bold text-kali-ink">
                  {(name.trim()[0] ?? "?").toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 py-1 pr-3 pl-1 backdrop-blur">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={toggleMic}
                aria-label={micOn ? "Mute mic" : "Unmute mic"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  micOn ? "bg-white text-kali-ink" : "bg-kali-danger text-white"
                )}
              >
                {micOn ? <Microphone className="h-4 w-4" /> : <MicrophoneSlash className="h-4 w-4" />}
              </motion.button>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20">
                <div ref={levelRef} className="h-full w-full origin-left rounded-full bg-kali-pink" />
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleCam}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
              className={cn(
                "absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full",
                camOn ? "bg-white text-kali-ink" : "bg-kali-danger text-white"
              )}
            >
              {camOn ? <Camera className="h-5 w-5" /> : <CameraSlash className="h-5 w-5" />}
            </motion.button>
          </div>

          {previewError && (
            <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
              {previewError}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <Label htmlFor="mic">Microphone</Label>
              <select
                id="mic"
                value={audioId}
                onChange={(e) => switchAudio(e.target.value)}
                className="kali-focus h-12 w-full rounded-2xl bg-white px-4 text-sm font-bold dark:bg-white/10"
              >
                <option value="">Default mic</option>
                {audioIns.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <Label htmlFor="cam">Camera</Label>
              <select
                id="cam"
                value={videoId}
                onChange={(e) => switchVideo(e.target.value)}
                className="kali-focus h-12 w-full rounded-2xl bg-white px-4 text-sm font-bold dark:bg-white/10"
              >
                <option value="">Default camera</option>
                {videoIns.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 rounded-[28px] bg-kali-pink p-8 sm:p-10">
          <div>
            <p className="text-sm font-bold tracking-wide text-kali-ink/70 uppercase">
              You&apos;re joining
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-kali-ink sm:text-4xl">
              {title}
            </h1>
          </div>
          <Field>
            <Label htmlFor="displayName" className="text-kali-ink">
              Display name
            </Label>
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={40}
              onKeyDown={(e) => {
                if (e.key === "Enter") join();
              }}
            />
          </Field>
          {joinError && (
            <p className="rounded-2xl bg-kali-danger px-4 py-3 text-sm font-bold text-white">
              {joinError}
            </p>
          )}
          <Button variant="primary" size="lg" onClick={join} disabled={joining}>
            {joining ? (
              <>
                <CircleNotch className="animate-spin" /> Getting you in…
              </>
            ) : (
              "Join the call"
            )}
          </Button>
          <p className="text-sm font-semibold text-kali-ink/75">
            No account needed. Be kind, unmute to say hi.
          </p>
        </div>
      </main>
    </div>
  );
}

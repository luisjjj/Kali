"use client";

import { useState } from "react";
import { Lobby, type JoinResult } from "./lobby";
import { MeetingRoom } from "./room";
import { EndedScreen } from "./ended-screen";
import { DoorOpen } from "@phosphor-icons/react";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { HomeLink } from "@/components/ui/home-link";
import Link from "next/link";

type Stage =
  | { name: "lobby" }
  | { name: "room"; join: JoinResult; micOn: boolean; camOn: boolean }
  | { name: "left" }
  | { name: "ended" };

export function MeetingFlow({
  roomCode,
  title,
  defaultName,
  isHost,
}: {
  roomCode: string;
  title: string;
  defaultName: string;
  isHost: boolean;
}) {
  const [stage, setStage] = useState<Stage>({ name: "lobby" });
  // Bump to force a fresh LiveKitRoom on rejoin.
  const [sessionKey, setSessionKey] = useState(0);

  if (stage.name === "ended") {
    return <EndedScreen title={title} />;
  }

  if (stage.name === "left") {
    return (
      <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-clip px-5">
        <KaliWordmark />
        <div className="kali-card flex w-full max-w-md flex-col items-center gap-3 px-8 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kali-pink-pale text-kali-pink">
            <DoorOpen className="h-7 w-7" weight="duotone" />
          </span>
          <h1 className="display-tight text-2xl font-semibold tracking-tight">You left the call</h1>
          <p className="text-sm leading-relaxed text-kali-muted">
            Nice seeing you. The room is still open if you want to hop back in.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button size="md" onClick={() => setStage({ name: "lobby" })}>
              Rejoin
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="md">
                Dashboard
              </Button>
            </Link>
            <HomeLink>
              <Button variant="ghost" size="md">
                Home
              </Button>
            </HomeLink>
          </div>
        </div>
      </div>
    );
  }

  if (stage.name === "room") {
    return (
      <MeetingRoom
        key={sessionKey}
        roomCode={roomCode}
        title={title}
        join={stage.join}
        displayName={defaultName}
        isHost={isHost || stage.join.isHost}
        startMicOn={stage.micOn}
        startCamOn={stage.camOn}
        onLeft={() => setStage({ name: "left" })}
        onEnded={() => setStage({ name: "ended" })}
        onRejoin={() => {
          setSessionKey((k) => k + 1);
          setStage({ name: "lobby" });
        }}
      />
    );
  }

  return (
    <Lobby
      title={title}
      roomCode={roomCode}
      defaultName={defaultName}
      onJoin={(join, media) =>
        setStage({ name: "room", join, micOn: media.micOn, camOn: media.camOn })
      }
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { isRoomId, normalizeRoomId } from "@/lib/room-code";

type JoinFormProps = {
  idPrefix?: string;
};

export function JoinForm({ idPrefix = "join" }: JoinFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const join = () => {
    const roomId = normalizeRoomId(code);
    if (!isRoomId(roomId)) {
      setError("That room name doesn't look right. Try study-gang or abc-def-ghi.");
      return;
    }
    const q = name.trim() ? `?name=${encodeURIComponent(name.trim().slice(0, 40))}` : "";
    router.push(`/m/${roomId}${q}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <Label htmlFor={`${idPrefix}-code`}>Room name or code</Label>
        <Input
          id={`${idPrefix}-code`}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          onBlur={() => {
            const roomId = normalizeRoomId(code);
            if (roomId && roomId !== code) setCode(roomId);
          }}
          placeholder="study-gang or abc-def-ghi"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="h-12 text-base font-semibold"
          onKeyDown={(e) => {
            if (e.key === "Enter") join();
          }}
        />
      </Field>
      <Field>
        <Label htmlFor={`${idPrefix}-name`}>Your name (optional)</Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should we call you?"
          maxLength={40}
          onKeyDown={(e) => {
            if (e.key === "Enter") join();
          }}
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl bg-kali-danger/10 px-4 py-3 text-sm font-semibold text-kali-danger">
          {error}
        </p>
      )}
      <Button type="button" size="lg" onClick={join}>
        Join the call <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

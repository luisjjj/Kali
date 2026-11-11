"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";
import { formatRoomCode, isRoomCode } from "@/lib/room-code";

type JoinFormProps = {
  tone?: "light" | "dark";
  idPrefix?: string;
};

export function JoinForm({ tone = "light", idPrefix = "join" }: JoinFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dark = tone === "dark";

  const join = () => {
    if (!isRoomCode(code)) {
      setError("That code doesn't look right. It looks like abc-def-ghi.");
      return;
    }
    const q = name.trim() ? `?name=${encodeURIComponent(name.trim().slice(0, 40))}` : "";
    router.push(`/m/${code.trim()}${q}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <Label
          htmlFor={`${idPrefix}-code`}
          className={dark ? "text-white/80" : "dark:text-kali-ink"}
        >
          Room code
        </Label>
        <Input
          id={`${idPrefix}-code`}
          value={code}
          onChange={(e) => {
            setCode(formatRoomCode(e.target.value));
            if (error) setError(null);
          }}
          placeholder="abc-def-ghi"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className={
            dark
              ? "border-2 border-kali-pink bg-white/10 text-center text-lg font-semibold tracking-widest text-white placeholder:text-white/40"
              : "border-2 border-kali-pink bg-kali-pink-pale/60 text-center text-lg font-semibold tracking-widest dark:bg-kali-pink-pale/60 dark:text-kali-ink dark:placeholder:text-kali-ink/40"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") join();
          }}
        />
      </Field>
      <Field>
        <Label
          htmlFor={`${idPrefix}-name`}
          className={dark ? "text-white/80" : "dark:text-kali-ink"}
        >
          Your name (optional)
        </Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should we call you?"
          maxLength={40}
          className={
            dark
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/40"
              : "dark:bg-kali-pink-pale dark:text-kali-ink dark:placeholder:text-kali-ink/40"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") join();
          }}
        />
      </Field>
      {error && (
        <p
          className={
            dark
              ? "rounded-2xl bg-kali-danger/20 px-4 py-3 text-sm font-bold text-white"
              : "rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger"
          }
        >
          {error}
        </p>
      )}
      <Button type="button" variant={dark ? "secondary" : "primary"} size="lg" onClick={join}>
        Join the call <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

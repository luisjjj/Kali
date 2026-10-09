"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { KaliWordmark } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/input";

function formatCode(raw: string): string {
  const clean = raw.toLowerCase().replace(/[^a-z2-9]/g, "").slice(0, 9);
  return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6, 9)]
    .filter(Boolean)
    .join("-");
}

const CODE_RE = /^[a-z2-9]{3}-[a-z2-9]{3}-[a-z2-9]{3}$/;

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const join = () => {
    if (!CODE_RE.test(code.trim())) {
      setError("That code doesn't look right. It looks like abc-def-ghi.");
      return;
    }
    const q = name.trim() ? `?name=${encodeURIComponent(name.trim().slice(0, 40))}` : "";
    router.push(`/m/${code.trim()}${q}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-kali-pink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <KaliWordmark />
        <Link href="/">
          <Button variant="ghost" size="sm" className="bg-white/60 hover:bg-white">
            Home
          </Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16">
        <div className="rounded-[32px] bg-white p-8 sm:p-10">
          <p className="text-sm font-semibold tracking-widest text-kali-ink/50 uppercase">
            Join as a guest
          </p>
          <h1 className="display-tight mt-1 text-3xl font-semibold sm:text-4xl">
            Got a code? You&apos;re in<span className="text-kali-pink">.</span>
          </h1>
          <p className="mt-2 text-kali-ink/65">
            No account needed. Just the code and whatever we should call you.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <Field>
              <Label htmlFor="code">Room code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(formatCode(e.target.value))}
                placeholder="abc-def-ghi"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="bg-kali-pink-pale/50 text-center text-lg font-semibold tracking-widest"
                onKeyDown={(e) => {
                  if (e.key === "Enter") join();
                }}
              />
            </Field>
            <Field>
              <Label htmlFor="name">Your name (optional)</Label>
              <Input
                id="name"
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
              <p className="rounded-2xl bg-kali-danger/10 px-4 py-3 text-sm font-bold text-kali-danger">
                {error}
              </p>
            )}
            <Button variant="primary" size="lg" onClick={join}>
              Join the call <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <p className="mt-5 text-center text-sm font-semibold text-kali-ink/65">
            Want to host your own calls?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-kali-ink underline">
              Make a free account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

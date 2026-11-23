"use client";

import { useState } from "react";
import { Check, LinkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function RecapCopyLink({ roomCode }: { roomCode: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${roomCode}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <Button variant="outline" size="md" onClick={copy}>
        {copied ? <Check className="h-4 w-4" weight="bold" /> : <LinkSimple className="h-4 w-4" />}
        {copied ? "Copied" : "Copy recap link"}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Recap link copied" : ""}
      </span>
    </>
  );
}

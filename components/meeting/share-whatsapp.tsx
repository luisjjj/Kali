"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function ShareWhatsApp({
  roomCode,
  title,
  showLabel = true,
  className,
}: {
  roomCode: string;
  title: string;
  showLabel?: boolean;
  className?: string;
}) {
  const share = () => {
    const url = `${window.location.origin}/m/${roomCode}`;
    const text = `Join me on Kali: ${title}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={share}
      title="Share to WhatsApp"
      aria-label={`Share ${title} to WhatsApp`}
      className={cn(
        "kali-press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#1faf55] px-4 py-2 text-sm font-semibold text-white hover:bg-[#199a49]",
        className
      )}
    >
      <WhatsappLogo className="h-4 w-4" weight="fill" />
      {showLabel && <span className="hidden sm:inline">WhatsApp</span>}
    </button>
  );
}

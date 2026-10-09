import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROOM_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateRoomCode(length = 9): string {
  // Format: xxx-xxx-xxx (human-friendly, no ambiguous chars)
  let raw = "";
  const cryptoObj =
    typeof globalThis !== "undefined" && "crypto" in globalThis
      ? globalThis.crypto
      : null;
  for (let i = 0; i < length; i++) {
    if (cryptoObj?.getRandomValues) {
      const buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      raw += ROOM_ALPHABET[buf[0] % ROOM_ALPHABET.length];
    } else {
      raw += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
    }
  }
  return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 9)}`;
}

export function meetingLink(roomCode: string, baseUrl?: string): string {
  const vercelBase =
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const base = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? vercelBase ?? "";
  return base ? `${base.replace(/\/$/, "")}/m/${roomCode}` : `/m/${roomCode}`;
}

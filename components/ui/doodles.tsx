import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Sticker = {
  /** Ink artwork for pink surfaces. */
  light: string;
  /** Paper artwork for the black theme. */
  dark: string;
  /** Position, size and breakpoint gate for the floating wrapper. */
  pos: string;
  rot: string;
  dur?: string;
  delay?: string;
};

const STICKERS: Sticker[] = [
  { light: "doodle-star-ink.svg", dark: "doodle-star-pink.svg", pos: "top-[clamp(7rem,6%,16rem)] right-[6%] w-10 hidden sm:block", rot: "10deg", dur: "5.5s", delay: "1.3s" },
  { light: "doodle-bubble.svg", dark: "doodle-bubble-paper.svg", pos: "top-[clamp(4rem,5%,12rem)] right-[17%] w-14 hidden sm:block", rot: "-6deg", dur: "6s", delay: "0s" },
  { light: "doodle-star-ink.svg", dark: "doodle-star-pink.svg", pos: "top-[17%] left-[2%] w-7 hidden md:block", rot: "-12deg", dur: "6.5s", delay: "2.1s" },
  { light: "doodle-squiggle.svg", dark: "doodle-squiggle-paper.svg", pos: "top-[30%] right-[4%] w-28 hidden lg:block", rot: "6deg", dur: "7s", delay: "0.6s" },
  { light: "doodle-star-ink.svg", dark: "doodle-star-pink.svg", pos: "top-[42%] left-[4%] w-10 hidden md:block", rot: "18deg", dur: "6s", delay: "2.8s" },
  { light: "doodle-bubble.svg", dark: "doodle-bubble-paper.svg", pos: "top-[55%] right-[3%] w-14 hidden md:block", rot: "8deg", dur: "6.5s", delay: "3.4s" },
  { light: "doodle-squiggle.svg", dark: "doodle-squiggle-paper.svg", pos: "bottom-[27%] left-[5%] w-24 hidden lg:block", rot: "-4deg", dur: "7s", delay: "1.9s" },
  { light: "doodle-star-ink.svg", dark: "doodle-star-pink.svg", pos: "bottom-[15%] right-[7%] w-8 hidden sm:block", rot: "-9deg", dur: "5.5s", delay: "0.9s" },
  { light: "doodle-star-ink.svg", dark: "doodle-star-pink.svg", pos: "bottom-[6%] left-[2%] w-5 hidden md:block", rot: "14deg", dur: "6s", delay: "3.9s" },
];

/**
 * Hand-drawn stickers for pink pages. Decorative only.
 * Ink artwork on pink, paper artwork on black. Pass `always` for panels that stay pink in dark mode.
 */
export function Doodles({ className, always }: { className?: string; always?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {STICKERS.map((s, i) => (
        <span key={i} className={cn("absolute", s.pos)} style={{ "--float-rot": s.rot } as CSSProperties}>
          <img
            src={`/images/${s.light}`}
            alt=""
            className={cn("animate-float h-auto w-full", !always && "dark:hidden")}
            style={{ animationDuration: s.dur, animationDelay: s.delay }}
          />
          {!always && (
            <img
              src={`/images/${s.dark}`}
              alt=""
              className="animate-float hidden h-auto w-full dark:block"
              style={{ animationDuration: s.dur, animationDelay: s.delay }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

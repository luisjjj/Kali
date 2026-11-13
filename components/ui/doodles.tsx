import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Kind = "spark" | "bubble" | "squiggle" | "loop";

type Mark = {
  kind: Kind;
  /** Position, width and breakpoint gate. */
  pos: string;
  rot: string;
  dx: string;
  dy: string;
  turn: string;
  dur: string;
  delay: string;
  draw: string;
  /** Rose accent instead of the default ink. */
  accent?: boolean;
};

/*
 * A handful of hand-drawn marks that sit outside the content column. They
 * draw themselves in once, then drift a few pixels on a slow loop. Opacity
 * stays low so text never fights with them.
 */
const PAGE_MARKS: Mark[] = [
  {
    kind: "bubble",
    pos: "top-[clamp(7rem,13%,11rem)] left-[3%] w-12 hidden xl:block",
    rot: "-7deg",
    dx: "5px",
    dy: "-7px",
    turn: "2deg",
    dur: "34s",
    delay: "-4s",
    draw: "0.35s",
  },
  {
    kind: "spark",
    pos: "top-[16%] right-[4.5%] w-7 hidden lg:block",
    rot: "9deg",
    dx: "-4px",
    dy: "-6px",
    turn: "-2.5deg",
    dur: "27s",
    delay: "-11s",
    draw: "0.9s",
  },
  {
    kind: "loop",
    pos: "top-[42%] left-[3.5%] w-9 hidden lg:block",
    rot: "-12deg",
    dx: "4px",
    dy: "-5px",
    turn: "3deg",
    dur: "38s",
    delay: "-20s",
    draw: "1.25s",
  },
  {
    kind: "squiggle",
    pos: "top-[57%] right-[3%] w-16 hidden xl:block",
    rot: "5deg",
    dx: "-6px",
    dy: "-4px",
    turn: "-1.5deg",
    dur: "35s",
    delay: "-8s",
    draw: "0.6s",
  },
  {
    kind: "spark",
    pos: "top-[73%] left-[4%] w-3.5 hidden md:block",
    rot: "14deg",
    dx: "3px",
    dy: "-4px",
    turn: "-3deg",
    dur: "24s",
    delay: "-15s",
    draw: "1.05s",
    accent: true,
  },
  {
    kind: "bubble",
    pos: "bottom-[7%] right-[7%] w-9 hidden lg:block",
    rot: "8deg",
    dx: "-5px",
    dy: "-6px",
    turn: "2deg",
    dur: "31s",
    delay: "-2s",
    draw: "0.75s",
  },
];

const PANEL_MARKS: Mark[] = [
  {
    kind: "bubble",
    pos: "top-[18%] right-[9%] w-10 hidden sm:block",
    rot: "-6deg",
    dx: "-4px",
    dy: "-5px",
    turn: "2deg",
    dur: "32s",
    delay: "-6s",
    draw: "0.4s",
  },
  {
    kind: "squiggle",
    pos: "top-[46%] right-[13%] w-14 hidden sm:block",
    rot: "4deg",
    dx: "4px",
    dy: "-4px",
    turn: "-1.5deg",
    dur: "36s",
    delay: "-18s",
    draw: "0.8s",
  },
  {
    kind: "loop",
    pos: "bottom-[22%] right-[8%] w-8 hidden sm:block",
    rot: "-10deg",
    dx: "3px",
    dy: "-5px",
    turn: "3deg",
    dur: "29s",
    delay: "-12s",
    draw: "1.15s",
  },
  {
    kind: "spark",
    pos: "bottom-[38%] right-[30%] w-3 hidden md:block",
    rot: "12deg",
    dx: "-3px",
    dy: "-3px",
    turn: "-3deg",
    dur: "25s",
    delay: "-3s",
    draw: "1s",
    accent: true,
  },
];

export function Doodles({
  className,
  variant = "page",
}: {
  className?: string;
  variant?: "page" | "panel";
}) {
  const marks = variant === "panel" ? PANEL_MARKS : PAGE_MARKS;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {marks.map((m, i) => (
        <span
          key={i}
          className={cn(
            "animate-doodle absolute",
            m.accent
              ? "text-kali-pink/45"
              : "text-foreground/[0.12] dark:text-foreground/[0.16]",
            m.pos
          )}
          style={
            {
              "--doodle-rot": m.rot,
              "--doodle-dx": m.dx,
              "--doodle-dy": m.dy,
              "--doodle-turn": m.turn,
              "--doodle-dur": m.dur,
              "--doodle-delay": m.delay,
              "--draw-delay": m.draw,
            } as CSSProperties
          }
        >
          <Art kind={m.kind} />
        </span>
      ))}
    </div>
  );
}

function Art({ kind }: { kind: Kind }) {
  if (kind === "spark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-auto w-full">
        <path
          d="M12 2.5c1.4 6.2 3.3 8.1 9.5 9.5-6.2 1.4-8.1 3.3-9.5 9.5-1.4-6.2-3.3-8.1-9.5-9.5 6.2-1.4 8.1-3.3 9.5-9.5Z"
          pathLength={1}
          className="doodle-stroke"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "bubble") {
    return (
      <svg viewBox="0 0 40 32" fill="none" className="h-auto w-full">
        <path
          d="M6 2.75h28a4 4 0 0 1 4 4V19a4 4 0 0 1-4 4H17.5l-6.6 5.7V23H6a4 4 0 0 1-4-4V6.75a4 4 0 0 1 4-4Z"
          pathLength={1}
          className="doodle-stroke"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <circle cx="12.5" cy="12.9" r="1.55" fill="currentColor" />
        <circle cx="20" cy="12.9" r="1.55" fill="var(--kali-pink)" opacity="0.75" />
        <circle cx="27.5" cy="12.9" r="1.55" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "squiggle") {
    return (
      <svg viewBox="0 0 80 24" fill="none" className="h-auto w-full">
        <path
          d="M2.5 14.5C8.5 4 14.5 4 20.5 14.5s12 10.5 18 0 12-10.5 18 0 12 10.5 18 0"
          pathLength={1}
          className="doodle-stroke"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-auto w-full">
      <path
        d="M27 12.5C25.5 6.8 20.6 3 15 3 8.8 3 4 8 4 14.3c0 6.2 5.1 11.2 11.4 11.2 5.5 0 10-4.4 10-9.6 0-4.6-3.8-8.2-8.4-8.2-4 0-7.2 3.2-7.2 7.1 0 3.2 2.6 5.8 5.7 5.8 2.4 0 4.4-2 4.4-4.4 0-1.7-1.4-3.1-3.1-3.1"
        pathLength={1}
        className="doodle-stroke"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

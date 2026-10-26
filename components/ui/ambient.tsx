import { cn } from "@/lib/utils";

// Full-page ambient background: a slowly drifting plus-and-dot texture with
// floating, twinkling stars. Sits behind all page content (needs the page
// root to be `isolate` so it paints above the page's own background color).
// Pure markup + CSS animations, safe in server components.
const STARS = [
  { pos: "top-[4%] left-[2%] w-10", dur: "11s", delay: "0s", rot: "-7deg" },
  { pos: "top-[7%] left-[42%] w-5", dur: "12s", delay: "5.2s", rot: "9deg" },
  { pos: "top-[9%] right-[6%] w-6", dur: "13s", delay: "1.6s", rot: "6deg" },
  { pos: "top-[28%] left-[2%] w-7", dur: "12s", delay: "3.2s", rot: "8deg" },
  { pos: "top-[36%] right-[3%] w-12", dur: "14s", delay: "2.2s", rot: "-6deg" },
  { pos: "top-[55%] right-[2%] w-6", dur: "10.5s", delay: "4.4s", rot: "7deg" },
  { pos: "top-[64%] left-[3%] w-6", dur: "12.5s", delay: "0.8s", rot: "-8deg" },
  { pos: "bottom-[16%] right-[9%] w-8", dur: "13.5s", delay: "2.8s", rot: "5deg" },
  { pos: "bottom-[9%] left-[4%] w-6", dur: "11.5s", delay: "3.8s", rot: "-5deg" },
] as const;

export function Ambient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {/* Oversized by one tile (56px) so the diagonal drift loops seamlessly */}
      <div
        className="animate-pattern absolute -inset-14 bg-[url('/images/pattern-pink.svg')] opacity-45 dark:bg-[url('/images/pattern-ink.svg')] dark:opacity-30"
      />
      {STARS.map((s, i) => (
        <div
          key={i}
          className={cn("animate-float-slow absolute", s.pos)}
          style={
            {
              animationDuration: s.dur,
              animationDelay: s.delay,
              "--float-rot": s.rot,
            } as React.CSSProperties
          }
        >
          <img
            src="/images/doodle-star-ink.svg"
            alt=""
            className="animate-twinkle w-full dark:hidden"
          />
          <img
            src="/images/doodle-star-pink.svg"
            alt=""
            className="animate-twinkle hidden w-full dark:block"
          />
        </div>
      ))}
    </div>
  );
}

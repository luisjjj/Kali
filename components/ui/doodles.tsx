import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Hand-drawn stickers for pink surfaces. Decorative only.
 * On pink pages they float at the edges; pass `always` for panels that stay pink in dark mode.
 */
export function Doodles({ className, always }: { className?: string; always?: boolean }) {
  const hideInDark = always ? "" : "dark:hidden";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <img
        src="/images/doodle-bubble.svg"
        alt=""
        className={cn("animate-float absolute top-[14%] left-[4%] hidden w-20 sm:block", hideInDark)}
        style={{ "--float-rot": "-6deg" } as CSSProperties}
      />
      <img
        src="/images/doodle-star-ink.svg"
        alt=""
        className={cn("animate-float absolute top-[24%] right-[6%] hidden w-12 sm:block", hideInDark)}
        style={{ "--float-rot": "10deg", animationDelay: "1.3s" } as CSSProperties}
      />
      <img
        src="/images/doodle-squiggle.svg"
        alt=""
        className={cn("absolute bottom-[12%] left-[7%] hidden w-28 opacity-80 lg:block", hideInDark)}
      />
      <img
        src="/images/doodle-star-ink.svg"
        alt=""
        className={cn("absolute right-[10%] bottom-[22%] hidden w-7 lg:block", hideInDark)}
      />
    </div>
  );
}

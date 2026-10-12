import { cn } from "@/lib/utils";

// Neutral shimmer block. Add width/height/rounding at the call site.
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton-shimmer bg-kali-ink/8 dark:bg-white/10", className)} />;
}

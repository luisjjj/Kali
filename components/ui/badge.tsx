import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "pink",
  children,
}: {
  className?: string;
  tone?: "pink" | "green" | "red" | "ink";
  children: React.ReactNode;
}) {
  const tones = {
    pink: "border-kali-pink bg-kali-pink-pale text-kali-ink dark:border-kali-pink/40",
    green: "border-kali-success/30 bg-kali-success/10 text-kali-success",
    red: "border-kali-danger/25 bg-kali-danger/10 text-kali-danger",
    ink: "border-white/15 bg-kali-ink text-white dark:bg-white/10",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-bold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kali-success opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-kali-success" />
    </span>
  );
}

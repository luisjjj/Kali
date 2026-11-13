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
    pink: "border-kali-pink/30 bg-kali-pink-pale text-foreground",
    green: "border-kali-success/25 bg-kali-success/10 text-kali-success",
    red: "border-kali-danger/25 bg-kali-danger/10 text-kali-danger",
    ink: "border-transparent bg-kali-ink text-kali-paper dark:bg-white/10",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
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
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kali-success opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-kali-success" />
    </span>
  );
}

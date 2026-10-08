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
    pink: "bg-kali-pink-pale text-kali-ink",
    green: "bg-kali-success/15 text-kali-success",
    red: "bg-kali-danger/10 text-kali-danger",
    ink: "bg-kali-ink text-white",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wide",
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

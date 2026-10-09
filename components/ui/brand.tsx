import Link from "next/link";
import { cn } from "@/lib/utils";

/** Kali's own simple wordmark — lowercase, chunky, with a pink dot. Original, no trademarks. */
export function KaliWordmark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-1 select-none", className)}>
      <span
        className={cn(
          "text-3xl font-bold tracking-tighter",
          dark ? "text-kali-paper" : "text-kali-ink dark:text-kali-paper"
        )}
      >
        kali
        <span className="text-kali-pink">.</span>
      </span>
    </Link>
  );
}

export function VideoTile({
  className,
  speaking,
  children,
  label,
}: {
  className?: string;
  speaking?: boolean;
  children: React.ReactNode;
  label?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-kali-ink transition-shadow duration-300",
        speaking && "kali-speaking",
        className
      )}
    >
      {children}
      {label && (
        <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}

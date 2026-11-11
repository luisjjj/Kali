import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { cn } from "@/lib/utils";

/** Kali's own simple wordmark. Lowercase, chunky, with a pink dot. Original, no trademarks. */
export function KaliWordmark({
  className,
  dark,
  tone = "auto",
  href,
}: {
  className?: string;
  dark?: boolean;
  /** "ink" / "paper" pin the color (use on always-pink panels); "auto" follows light/dark mode. */
  tone?: "ink" | "paper" | "auto";
  /** Pass null to render the wordmark without a link. Defaults to Home. */
  href?: string | null;
}) {
  const color =
    tone === "ink"
      ? "text-kali-ink"
      : tone === "paper"
        ? "text-kali-paper"
        : dark
          ? "text-kali-paper"
          : "text-kali-ink dark:text-kali-paper";
  // The brand dot must stay visible on pink surfaces, so it only goes pink on dark ones.
  const dot =
    tone === "paper" ? "text-kali-pink" : tone === "ink" ? "text-kali-ink" : "text-kali-ink dark:text-kali-pink";
  const classes = cn("inline-flex items-center gap-1 select-none", className);
  const mark = (
    <span className={cn("text-3xl font-bold tracking-tighter", color)}>
      kali
      <span className={dot}>.</span>
    </span>
  );

  if (href === null) {
    return <span className={classes}>{mark}</span>;
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {mark}
      </Link>
    );
  }

  return (
    <HomeLink className={classes}>
      {mark}
    </HomeLink>
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

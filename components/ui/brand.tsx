import Link from "next/link";
import { HomeLink } from "@/components/ui/home-link";
import { cn } from "@/lib/utils";

/** Kali's own simple wordmark. Lowercase, confident, with a rose dot. Original, no trademarks. */
export function KaliWordmark({
  className,
  href,
}: {
  className?: string;
  /** Pass null to render the wordmark without a link. Defaults to Home. */
  href?: string | null;
}) {
  const classes = cn("inline-flex items-center gap-1 select-none", className);
  const mark = (
    <span className="text-3xl font-semibold tracking-tighter text-foreground">
      kali
      <span className="text-kali-accent">.</span>
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

  return <HomeLink className={classes}>{mark}</HomeLink>;
}

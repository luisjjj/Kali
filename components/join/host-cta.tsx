import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StartYourOwnCallProps = Pick<ComponentProps<typeof Button>, "variant" | "size"> & {
  className?: string;
};

export function StartYourOwnCall({
  variant = "primary",
  size = "lg",
  className,
}: StartYourOwnCallProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/auth/sign-up">Start your own call, free</Link>
    </Button>
  );
}

export function PoweredByKali({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-kali-ink/50 transition-colors hover:text-kali-ink dark:text-kali-paper/50 dark:hover:text-kali-paper",
        className
      )}
    >
      Powered by
      <span className="font-bold tracking-tight">
        kali<span className="text-kali-pink">.</span>
      </span>
    </Link>
  );
}

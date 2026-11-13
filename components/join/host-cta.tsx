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
        "inline-flex items-center gap-1.5 text-xs font-medium text-kali-muted transition-colors hover:text-foreground",
        className
      )}
    >
      Powered by
      <span className="font-bold tracking-tight">
        kali<span className="text-kali-accent">.</span>
      </span>
    </Link>
  );
}

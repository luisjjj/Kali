"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, House } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const HIDDEN_FIXED_ROUTES = new Set(["/", "/desktop"]);

/**
 * Back and Home controls for the desktop shell.
 *
 * The shell has no browser chrome, so pages need their own way out. The
 * `.kali-desktop-only` class is toggled by the tiny script in app/layout.tsx
 * after checking the Electron user agent. It is hidden in normal browsers.
 */
export function DesktopNav({
  fixed = false,
  className,
}: {
  fixed?: boolean;
  className?: string;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  if (
    fixed &&
    (HIDDEN_FIXED_ROUTES.has(pathname) ||
      pathname === "/m" ||
      pathname.startsWith("/m/"))
  ) {
    return null;
  }

  const goBack = () => {
    // Electron starts on /desktop, so history is normally available. If a page
    // is opened directly, fall back to the desktop start page instead of
    // leaving the user stuck.
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/desktop");
  };

  return (
    <nav
      aria-label="Desktop navigation"
      className={cn(
        "kali-desktop-only items-center gap-0.5 rounded-full border border-line bg-surface/95 p-1 text-foreground shadow-lg backdrop-blur",
        fixed && "fixed bottom-4 left-4 z-[60]",
        className
      )}
    >
      <button
        type="button"
        onClick={goBack}
        className="kali-press kali-focus inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)]"
      >
        <ArrowLeft className="h-4 w-4" weight="bold" />
        Back
      </button>
      <span aria-hidden className="h-4 w-px bg-line" />
      <Link
        href="/desktop"
        className="kali-press kali-focus inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)]"
      >
        <House className="h-4 w-4 text-kali-accent" weight="bold" />
        Home
      </Link>
    </nav>
  );
}

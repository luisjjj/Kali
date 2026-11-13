"use client";

import { MoonStars, SunDim } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Flips the .dark class on <html> and remembers the choice.
 * First visit follows the OS setting (see the tiny script in app/layout.tsx).
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("kali-theme", next ? "dark" : "light");
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#0a0a0b" : "#ffb3cd");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className={cn(
        "kali-press kali-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-foreground hover:bg-[var(--surface-muted)]",
        className
      )}
    >
      <SunDim className="h-4.5 w-4.5 dark:hidden" weight="bold" />
      <MoonStars className="hidden h-4.5 w-4.5 dark:block" weight="bold" />
    </button>
  );
}

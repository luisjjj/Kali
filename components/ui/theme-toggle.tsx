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
    if (meta) meta.setAttribute("content", next ? "#000000" : "#ffa8cd");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className={cn(
        "kali-press kali-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-kali-ink/10 bg-white text-kali-ink hover:border-kali-ink/30 dark:border-white/20 dark:bg-black dark:text-kali-paper dark:hover:border-white/40",
        className
      )}
    >
      <SunDim className="h-5 w-5 dark:hidden" weight="bold" />
      <MoonStars className="hidden h-5 w-5 dark:block" weight="bold" />
    </button>
  );
}

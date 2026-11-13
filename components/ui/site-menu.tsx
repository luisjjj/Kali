"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LINKS = [
  ["#features", "Features"],
  ["#how", "How it works"],
  ["#hosts", "For hosts"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
] as const;

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="kali-press kali-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-foreground hover:bg-[var(--surface-muted)]"
      >
        {open ? (
          <X className="h-4.5 w-4.5" weight="bold" />
        ) : (
          <List className="h-4.5 w-4.5" weight="bold" />
        )}
      </button>

      {open && (
        <div
          id="site-menu"
          className="animate-menu-in absolute top-[calc(100%+0.85rem)] right-0 z-50 w-[min(17rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-surface p-2 shadow-[0_18px_40px_-12px_rgba(23,20,18,0.28)]"
        >
          <nav aria-label="Sections" className="flex flex-col">
            {LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="kali-focus rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-muted)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="my-2 border-t border-line" />
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-sm font-medium text-kali-muted">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="p-1 pt-2">
            <Link href="/join" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                Join a call
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

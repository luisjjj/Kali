"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number[]>([]);
  const baseId = useId();
  const reduce = useReducedMotion();

  const toggle = (index: number) =>
    setOpen((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));

  const transition = reduce
    ? { duration: 0 }
    : {
        height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
        opacity: { duration: 0.2, ease: "easeOut" as const },
      };

  return (
    <div className="mt-8 flex flex-col gap-3">
      {items.map((f, index) => {
        const isOpen = open.includes(index);
        const panelId = `${baseId}-faq-panel-${index}`;
        return (
          <div
            key={f.q}
            className={cn(
              "rounded-[24px] px-6 py-5 transition-colors duration-300",
              isOpen
                ? "bg-kali-ink text-white"
                : "bg-white text-kali-ink shadow-[0_18px_44px_-30px_rgba(23,18,15,0.4)]",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold"
            >
              {f.q}
              <CaretDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <p className="pt-2 leading-relaxed text-white/70">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

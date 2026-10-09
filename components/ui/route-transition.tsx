"use client";

import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import type { ReactNode } from "react";

// Animates every navigation: each route fades and rises on entry.
// Exit animation is intentionally skipped (App Router unmounts the old
// tree immediately), so this stays a simple remount transition.
// Respects the OS reduced-motion setting via MotionConfig.
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

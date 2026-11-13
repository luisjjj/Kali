"use client";

import { motion } from "framer-motion";
import { VideoCamera, WarningCircle } from "@phosphor-icons/react";

export function PageLoader({ message = "Warming up…" }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <motion.div
        className="h-2.5 w-2.5 rounded-full bg-kali-accent"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="text-sm font-medium text-kali-muted">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="kali-card flex flex-col items-center gap-3 px-8 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-[var(--surface-muted)] text-kali-muted">
        <VideoCamera className="h-6 w-6" weight="duotone" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {body && <p className="max-w-sm text-sm leading-relaxed text-kali-muted">{body}</p>}
      {action}
    </motion.div>
  );
}

export function ErrorState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="kali-card flex flex-col items-center gap-3 px-8 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kali-danger/10 text-kali-danger">
        <WarningCircle className="h-6 w-6" weight="duotone" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {body && <p className="max-w-sm text-sm leading-relaxed text-kali-muted">{body}</p>}
    </div>
  );
}

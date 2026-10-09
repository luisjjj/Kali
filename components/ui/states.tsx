"use client";

import { motion } from "framer-motion";

export function PageLoader({ message = "Warming up…" }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <motion.div
        className="h-12 w-12 rounded-full bg-kali-pink"
        animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="font-bold text-kali-ink/65 dark:text-kali-paper/65">{message}</p>
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
      className="flex flex-col items-center gap-3 rounded-[28px] bg-kali-pink-pale/60 px-8 py-12 text-center"
    >
      <div className="text-4xl">🫧</div>
      <h3 className="text-xl font-bold text-kali-ink">{title}</h3>
      {body && <p className="max-w-sm leading-relaxed text-kali-ink/65">{body}</p>}
      {action}
    </motion.div>
  );
}

export function ErrorState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] bg-kali-danger/10 px-8 py-12 text-center">
      <div className="text-4xl">🙈</div>
      <h3 className="text-xl font-bold text-kali-danger">{title}</h3>
      {body && <p className="max-w-sm leading-relaxed text-kali-danger/80">{body}</p>}
    </div>
  );
}

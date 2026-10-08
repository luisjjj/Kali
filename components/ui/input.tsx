import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "kali-focus h-13 w-full rounded-2xl bg-white px-5 py-3.5 text-base font-medium text-kali-ink placeholder:text-kali-muted/80 border-2 border-transparent focus:border-kali-pink",
        "dark:bg-white/10 dark:text-kali-paper dark:placeholder:text-kali-muted",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-bold text-kali-ink dark:text-kali-paper", className)}
      {...props}
    />
  );
}

export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "kali-press kali-focus inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-kali-pink text-kali-ink shadow-[0_1px_2px_rgba(23,20,18,0.12)] hover:bg-kali-pink-hover",
        ghost:
          "bg-transparent text-foreground hover:bg-[var(--surface-muted)]",
        danger: "bg-kali-danger text-white hover:brightness-95",
        outline:
          "border border-line bg-surface text-foreground hover:bg-[var(--surface-muted)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };

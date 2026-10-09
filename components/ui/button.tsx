import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "kali-press kali-focus inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: black pill, white text
        primary: "bg-kali-ink text-white hover:bg-black",
        // Secondary: pink pill, black text
        secondary: "bg-kali-pink text-kali-ink hover:bg-kali-pink-hover",
        // Ghost: pale pink fill
        ghost: "bg-kali-pink-pale text-kali-ink hover:bg-kali-pink/40",
        // Danger: red pill for leave / end call
        danger: "bg-kali-danger text-white hover:brightness-95",
        // Outline: soft fill fallback for low emphasis
        outline: "bg-white text-kali-ink border-2 border-kali-pink-pale hover:bg-kali-pink-pale/60",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        md: "h-12 px-7 text-base",
        lg: "h-14 px-9 text-lg",
        icon: "h-12 w-12",
        "icon-lg": "h-14 w-14",
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

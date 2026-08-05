import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Aligns with `BUTTON` in design.ts — primary is signal purple, never pure white. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-[transform,filter,background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:brightness-110",
        outline:
          "border border-border bg-surface-1 text-foreground hover:border-primary/45 hover:bg-surface-2",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9 min-h-9 px-4",
        md: "h-11 min-h-11 px-6",
        lg: "h-12 min-h-12 px-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-sans font-semibold tracking-wide transition-all duration-500 ease-[var(--ease-luxury)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lantern focus-visible:ring-offset-2 focus-visible:ring-offset-dusk disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        gold: [
          "bg-gradient-to-b from-lantern-glow to-lantern text-night",
          "shadow-[0_10px_32px_-8px_rgba(244,196,68,0.65)]",
          "hover:shadow-[0_16px_40px_-8px_rgba(244,196,68,0.85)] hover:-translate-y-0.5",
        ],
        "lantern-rose": [
          "bg-gradient-to-b from-blush to-lantern-rose text-night",
          "shadow-[0_10px_32px_-8px_rgba(232,130,154,0.65)]",
          "hover:shadow-[0_16px_40px_-8px_rgba(232,130,154,0.85)] hover:-translate-y-0.5",
        ],
        outline: [
          "border border-lantern/60 bg-dusk/40 text-lantern-soft backdrop-blur-sm",
          "hover:border-lantern hover:bg-dusk/70 hover:-translate-y-0.5",
        ],
        "outline-rose": [
          "border border-lantern-rose/60 bg-cream/50 text-lantern-rose backdrop-blur-sm",
          "hover:border-lantern-rose hover:bg-cream/80 hover:-translate-y-0.5",
        ],
        ghost: "text-lantern-rose hover:bg-lantern-rose/10",
      },
      size: {
        sm: "h-10 px-5 text-xs uppercase",
        md: "h-12 px-7 text-sm uppercase",
        lg: "h-14 px-10 text-sm uppercase tracking-[0.2em]",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  }
);

export interface GoldButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  shimmer?: boolean;
}

export const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant, size, shimmer = true, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {shimmer && variant !== "ghost" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:translate-x-full"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

GoldButton.displayName = "GoldButton";

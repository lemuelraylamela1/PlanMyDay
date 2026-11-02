import * as React from "react";
import { cn } from "@/lib/utils";

/** Animated gold-foil shimmer text. */
export function GoldShimmer({
  as: Tag = "span",
  className,
  children,
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("text-gold-foil", className)} {...props}>
      {children}
    </Tag>
  );
}

/** Animated rose-gold shimmer text. */
export function RoseShimmer({
  as: Tag = "span",
  className,
  children,
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("text-rose-shimmer", className)} {...props}>
      {children}
    </Tag>
  );
}

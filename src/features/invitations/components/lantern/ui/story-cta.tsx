"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SPARKS = [
  { top: "8%", left: "6%", delay: "0s", duration: "2.4s" },
  { top: "18%", left: "92%", delay: "0.55s", duration: "2.8s" },
  { top: "78%", left: "10%", delay: "1.1s", duration: "2.2s" },
  { top: "72%", left: "88%", delay: "0.3s", duration: "3s" },
  { top: "-6%", left: "48%", delay: "0.85s", duration: "2.6s" },
  { top: "104%", left: "58%", delay: "1.4s", duration: "2.5s" },
] as const;

type StoryCtaProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
};

/**
 * Magical hero CTA — warm lantern-gold with aura, foil sweep, and sparkles.
 * Scoped to the lantern invite experience; does not replace GoldButton.
 */
export function StoryCta({
  className,
  children = "Enter Our Story",
  href,
  ...props
}: StoryCtaProps) {
  const content = (
    <>
      <span aria-hidden className="story-cta-aura" />
      <span aria-hidden className="story-cta-ring" />
      <span aria-hidden className="story-cta-sheen" />
      <span aria-hidden className="story-cta-sparks">
        {SPARKS.map((spark, i) => (
          <span
            key={i}
            className="story-cta-spark"
            style={{
              top: spark.top,
              left: spark.left,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </span>
      <span className="story-cta-label">{children}</span>
    </>
  );

  const classes = cn("story-cta", className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}

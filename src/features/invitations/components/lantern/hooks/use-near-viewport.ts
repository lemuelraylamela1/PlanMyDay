"use client";

import * as React from "react";

/**
 * Becomes true once the element intersects the viewport (with optional rootMargin).
 * Used to defer heavy WebGL mounts until a section is about to be seen.
 */
export function useNearViewport<T extends Element>(
  ref: React.RefObject<T | null>,
  {
    rootMargin = "40% 0px",
    once = true,
    enabled = true,
  }: {
    rootMargin?: string;
    once?: boolean;
    enabled?: boolean;
  } = {},
) {
  const [near, setNear] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setNear(false);
      return;
    }
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNear(true);
        if (once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once, enabled]);

  return near;
}

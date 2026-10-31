import { cn } from "@/lib/utils";

interface Props {
  count: number;
  className?: string;
}

/**
 * Soft golden star field. Each star is addressed with `[data-star]` so the
 * parent timeline can twinkle them in and send them outward. No SVG filters —
 * the glow is a layered box-shadow, which is cheap on phones.
 */
export function MagicalStars({ count, className }: Props) {
  const stars = Array.from({ length: count }, (_, i) => {
    // Irregular scatter so idle twinkles don't form dotted lines.
    const u = ((i * 0.6180339887) % 1);
    const v = ((i * 0.3819660113 + 0.17) % 1);
    const depth = i % 4;
    return {
      id: i,
      left: `${2 + u * 96}%`,
      top: `${3 + v * 92}%`,
      size: depth === 0 ? 3 : depth === 1 ? 5 : depth === 2 ? 7 : 10,
      delay: (i % 9) * 0.08,
      angle: (i / count) * Math.PI * 2 + ((i * 11) % 7) * 0.07,
    };
  });

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {stars.map((s) => (
        <span
          key={s.id}
          data-star
          data-angle={s.angle}
          data-delay={s.delay}
          className="absolute opacity-0"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
            backgroundImage:
              "radial-gradient(circle, #FFF8E4 0%, #FFE2A0 38%, rgba(255,200,120,0.35) 62%, transparent 74%)",
            boxShadow: `0 0 ${s.size * 1.6}px rgba(255,220,150,0.85), 0 0 ${s.size * 3.4}px rgba(255,190,110,0.35)`,
            clipPath:
              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        />
      ))}
    </div>
  );
}

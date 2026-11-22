"use client";

import * as React from "react";

/**
 * Fairytale castle at dusk — same silhouette as before, re-lit for the night
 * scene: moonlit rose stone, cylindrical tower shading, twilight-blue roofs
 * with a warm lantern rim light, glowing windows and a lit gateway.
 *
 * Performance: no SVG filters (feGaussianBlur re-rasterises on every frame the
 * castle moves/fades). All glows are radial-gradient fills instead.
 */
export function CastleSilhouette({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = React.useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  /** Round tower body with cylinder shading + a gold string course under the parapet. */
  const Tower = ({
    x,
    top,
    w,
    fill,
    band = true,
  }: {
    x: number;
    top: number;
    w: number;
    fill: string;
    band?: boolean;
  }) => (
    <>
      <rect x={x} y={top} width={w} height={460 - top} fill={url(fill)} />
      <rect x={x} y={top} width={w} height={460 - top} fill={url("cyl")} />
      {band ? (
        <rect x={x} y={top + 6} width={w} height={2} fill={url("gold")} opacity="0.55" />
      ) : null}
    </>
  );

  /** Conical roof: body, rim-lit overlay, shadow side, tile bands, gold brim. */
  const Cone = ({
    cx,
    apex,
    base,
    half,
    tall = false,
  }: {
    cx: number;
    apex: number;
    base: number;
    half: number;
    tall?: boolean;
  }) => {
    const d = `M${cx - half} ${base} L${cx} ${apex} L${cx + half} ${base} Z`;
    const bands = [0.42, 0.64, 0.84].map((t) => {
      const y = apex + (base - apex) * t;
      const hw = half * t;
      return `M${cx - hw} ${y} Q${cx} ${y + 3.5 * t} ${cx + hw} ${y}`;
    });
    return (
      <>
        <ellipse cx={cx} cy={base + 1} rx={half + 5} ry={half * 0.2} fill="#152c58" opacity="0.9" />
        <path d={d} fill={url(tall ? "roofTall" : "roof")} />
        <path d={d} fill={url("roofRim")} />
        <path d={`M${cx} ${apex} L${cx - half} ${base} L${cx} ${base} Z`} fill="#0a1a3a" opacity="0.28" />
        {bands.map((b, i) => (
          <path key={i} d={b} fill="none" stroke="#0a1a3a" strokeOpacity="0.32" strokeWidth="1.1" />
        ))}
        <path
          d={`M${cx - half - 3} ${base} Q${cx} ${base + half * 0.22} ${cx + half + 3} ${base}`}
          fill="none"
          stroke={url("gold")}
          strokeWidth="1.6"
          opacity="0.75"
        />
      </>
    );
  };

  /** Gold finial with a waving swallowtail pennant. */
  const Pennant = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Solid stroke: a gradient can't paint a zero-width (vertical) line. */}
      <line x1="0" y1="0" x2="0" y2="-30" stroke="#e8bf55" strokeWidth="1.6" />
      <path
        d="M0 -30 c8 -4 15 3 24 -1 l-5 7 5 7 c-9 4 -16 -3 -24 1 Z"
        fill={url("pennant")}
      />
      <circle cx="0" cy="0" r="3.6" fill={url("gold")} />
    </g>
  );

  /** Arched lit window with a soft halo and a centre mullion. */
  const Win = ({
    x,
    y,
    w = 14,
    h = 20,
    o = 0.9,
  }: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    o?: number;
  }) => (
    <g opacity={o}>
      <circle cx={x + w / 2} cy={y + h / 2} r={w * 1.7} fill={url("halo")} />
      <path
        d={`M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z`}
        fill={url("win")}
      />
      <line
        x1={x + w / 2}
        y1={y + 2}
        x2={x + w / 2}
        y2={y + h}
        stroke="#8a4a2a"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
    </g>
  );

  return (
    <svg
      viewBox="0 0 1440 460"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      className={className}
      style={style}
    >
      <defs>
        {/* Moonlit rose stone — darker toward the base so it settles into the night. */}
        <linearGradient id={id("stoneFar")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a86ae" />
          <stop offset="100%" stopColor="#3e2f55" />
        </linearGradient>
        <linearGradient id={id("stoneMid")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dccadb" />
          <stop offset="50%" stopColor="#a98da9" />
          <stop offset="100%" stopColor="#4a3658" />
        </linearGradient>
        <linearGradient id={id("stoneNear")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1e3e7" />
          <stop offset="45%" stopColor="#c7a6b9" />
          <stop offset="100%" stopColor="#56395c" />
        </linearGradient>
        <linearGradient id={id("stoneKeep")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcf1ef" />
          <stop offset="38%" stopColor="#dfc0cf" />
          <stop offset="100%" stopColor="#664466" />
        </linearGradient>

        {/* Cylinder shading: shadowed left edge, lantern-lit right-of-centre, soft right edge. */}
        <linearGradient id={id("cyl")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a0e28" stopOpacity="0.55" />
          <stop offset="28%" stopColor="#1a0e28" stopOpacity="0.14" />
          <stop offset="60%" stopColor="#fff0d4" stopOpacity="0.16" />
          <stop offset="84%" stopColor="#1a0e28" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1a0e28" stopOpacity="0.48" />
        </linearGradient>

        {/* Twilight-blue roofs (deeper than daytime sky-blue) + warm rim light. */}
        <linearGradient id={id("roof")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f9fdc" />
          <stop offset="45%" stopColor="#2f5d9f" />
          <stop offset="100%" stopColor="#172f5e" />
        </linearGradient>
        <linearGradient id={id("roofTall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8db8ea" />
          <stop offset="35%" stopColor="#3a6db3" />
          <stop offset="100%" stopColor="#142a55" />
        </linearGradient>
        <linearGradient id={id("roofRim")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0b1c3d" stopOpacity="0.35" />
          <stop offset="48%" stopColor="#a9cdf4" stopOpacity="0.22" />
          <stop offset="78%" stopColor="#ffd98a" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id={id("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0a8" />
          <stop offset="50%" stopColor="#f4c444" />
          <stop offset="100%" stopColor="#c4893a" />
        </linearGradient>
        <linearGradient id={id("pennant")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4c444" />
          <stop offset="100%" stopColor="#e8829a" />
        </linearGradient>

        <linearGradient id={id("win")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="55%" stopColor="#ffd06a" />
          <stop offset="100%" stopColor="#e89040" />
        </linearGradient>
        <radialGradient id={id("halo")}>
          <stop offset="0%" stopColor="#ffd76a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffd76a" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={id("gateLight")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffeab0" />
          <stop offset="60%" stopColor="#ffbf5a" />
          <stop offset="100%" stopColor="#e88a3a" />
        </linearGradient>
        <radialGradient id={id("spill")}>
          <stop offset="0%" stopColor="#ffd06a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd06a" stopOpacity="0" />
        </radialGradient>

        {/* Warm aura behind the keep and the night mist at the base. */}
        <radialGradient id={id("aura")} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ffd76a" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#e8829a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#2d1b5e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("mist")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12081f" stopOpacity="0" />
          <stop offset="100%" stopColor="#12081f" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Lantern-light aura behind the palace */}
      <ellipse cx="720" cy="300" rx="520" ry="230" fill={url("aura")} />

      {/* ════════ FAR WINGS (distant, cooler, dimmer) ════════ */}
      <g opacity="0.9">
        <rect x="180" y="355" width="90" height="105" fill={url("stoneFar")} />
        <Cone cx={225} apex={313} base={355} half={35} />
        <Win x={219} y={388} w={10} h={14} o={0.6} />

        <rect x="1170" y="355" width="90" height="105" fill={url("stoneFar")} />
        <Cone cx={1215} apex={313} base={355} half={35} />
        <Win x={1210} y={388} w={10} h={14} o={0.6} />

        <Tower x={290} top={320} w={48} fill="stoneFar" band={false} />
        <Cone cx={314} apex={270} base={320} half={16} />
        <circle cx="314" cy="266" r="2.6" fill={url("gold")} />
        <Win x={309} y={360} w={9} h={12} o={0.5} />

        <Tower x={1102} top={320} w={48} fill="stoneFar" band={false} />
        <Cone cx={1126} apex={270} base={320} half={16} />
        <circle cx="1126" cy="266" r="2.6" fill={url("gold")} />
        <Win x={1121} y={360} w={9} h={12} o={0.5} />
      </g>

      {/* ════════ OUTER CURTAIN + CORNER TOWERS ════════ */}
      <g>
        <Tower x={380} top={250} w={88} fill="stoneMid" />
        <path
          d="M380 250 h11 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h11"
          fill={url("stoneMid")}
        />
        <Cone cx={424} apex={155} base={250} half={46} />
        <Pennant x={424} y={152} />

        <Tower x={972} top={250} w={88} fill="stoneMid" />
        <path
          d="M972 250 h11 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h11"
          fill={url("stoneMid")}
        />
        <Cone cx={1016} apex={155} base={250} half={46} />
        <Pennant x={1016} y={152} />

        {/* Curtain walls */}
        <rect x="468" y="310" width="95" height="150" fill={url("stoneMid")} />
        <rect x="468" y="310" width="95" height="150" fill="#1a0e28" opacity="0.18" />
        <path
          d="M468 310 h12 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h13"
          fill={url("stoneMid")}
        />
        <rect x="877" y="310" width="95" height="150" fill={url("stoneMid")} />
        <rect x="877" y="310" width="95" height="150" fill="#1a0e28" opacity="0.12" />
        <path
          d="M877 310 h12 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h13"
          fill={url("stoneMid")}
        />
      </g>

      {/* ════════ MID FLANKING TOWERS ════════ */}
      <g>
        <Tower x={545} top={195} w={78} fill="stoneNear" />
        <path
          d="M545 195 h10 v-11 h13 v11 h13 v-11 h13 v11 h13 v-11 h11"
          fill={url("stoneNear")}
        />
        <Cone cx={584} apex={107} base={195} half={40} tall />
        <Pennant x={584} y={104} s={1.05} />

        <Tower x={817} top={195} w={78} fill="stoneNear" />
        <path
          d="M817 195 h10 v-11 h13 v11 h13 v-11 h13 v11 h13 v-11 h11"
          fill={url("stoneNear")}
        />
        <Cone cx={856} apex={107} base={195} half={40} tall />
        <Pennant x={856} y={104} s={1.05} />
      </g>

      {/* Inner courtyard walls */}
      <rect x="623" y="285" width="70" height="175" fill={url("stoneNear")} />
      <rect x="623" y="285" width="70" height="175" fill="#1a0e28" opacity="0.16" />
      <rect x="747" y="285" width="70" height="175" fill={url("stoneNear")} />
      <rect x="747" y="285" width="70" height="175" fill="#1a0e28" opacity="0.1" />
      <path
        d="M623 285 h11 v-9 h12 v9 h12 v-9 h12 v9 h12 v-9 h11"
        fill={url("stoneNear")}
      />
      <path
        d="M747 285 h11 v-9 h12 v9 h12 v-9 h12 v9 h12 v-9 h11"
        fill={url("stoneNear")}
      />

      {/* Buttresses */}
      <path d="M640 460 V300 l15-22 h12 V460 Z" fill={url("stoneMid")} />
      <path d="M640 460 V300 l15-22 h12 V460 Z" fill="#1a0e28" opacity="0.22" />
      <path d="M785 460 V300 l-15-22 h-12 V460 Z" fill={url("stoneMid")} />
      <path d="M785 460 V300 l-15-22 h-12 V460 Z" fill="#1a0e28" opacity="0.14" />

      {/* ════════ CENTRAL KEEP — focal spire ════════ */}
      <g>
        <Tower x={655} top={155} w={130} fill="stoneKeep" band={false} />

        {/* Lantern gallery with columns */}
        <rect x="662" y="235" width="116" height="22" rx="3" fill="#4a2c50" opacity="0.4" />
        <path
          d="M662 235 h10 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h12"
          fill={url("stoneKeep")}
        />
        <rect x="662" y="257" width="116" height="2" fill={url("gold")} opacity="0.6" />
        {[676, 698, 720, 742, 764].map((x) => (
          <rect key={x} x={x} y="237" width="3" height="18" rx="1" fill="#fff6f0" opacity="0.5" />
        ))}
        {/* Warm light between the gallery columns */}
        {[684, 706, 728, 750].map((x) => (
          <rect key={x} x={x} y="240" width="10" height="14" rx="2" fill={url("win")} opacity="0.55" />
        ))}

        {/* Stepped crown */}
        <rect x="668" y="137" width="104" height="18" fill={url("stoneKeep")} />
        <rect x="668" y="137" width="104" height="18" fill={url("cyl")} />
        <rect x="668" y="153" width="104" height="2" fill={url("gold")} opacity="0.7" />

        <Cone cx={720} apex={9} base={137} half={52} tall />
        <path d="M720 9 L772 137 L720 137 Z" fill="#c8e4ff" opacity="0.12" />
        <Pennant x={720} y={6} s={1.2} />

        {/* Grand arched gateway — warm light pouring out */}
        <ellipse cx="720" cy="458" rx="90" ry="14" fill={url("spill")} />
        <path d="M684 460 V372 q36-48 72 0 V460 Z" fill="#24142e" />
        <path d="M692 460 V379 q28-36 56 0 V460 Z" fill={url("gateLight")} opacity="0.9" />
        <line x1="720" y1="352" x2="720" y2="460" stroke="#7a3a1e" strokeOpacity="0.45" strokeWidth="1.5" />
        <path
          d="M684 460 V372 q36-48 72 0 V460"
          fill="none"
          stroke={url("gold")}
          strokeWidth="2.6"
          opacity="0.85"
        />
        <circle cx="720" cy="341" r="3.2" fill={url("gold")} />
      </g>

      {/* ════════ WINDOWS ════════ */}
      {/* Keep */}
      <Win x={678} y={175} o={0.9} />
      <Win x={713} y={175} o={1} />
      <Win x={748} y={175} o={0.88} />
      <Win x={678} y={275} o={0.85} />
      <Win x={713} y={275} o={0.95} />
      <Win x={748} y={275} o={0.8} />
      {/* Mid towers */}
      <Win x={568} y={228} w={12} h={17} o={0.85} />
      <Win x={588} y={228} w={12} h={17} o={0.75} />
      <Win x={576} y={300} w={12} h={17} o={0.7} />
      <Win x={840} y={228} w={12} h={17} o={0.88} />
      <Win x={860} y={228} w={12} h={17} o={0.78} />
      <Win x={848} y={300} w={12} h={17} o={0.72} />
      {/* Corner towers */}
      <Win x={408} y={298} w={11} h={15} o={0.72} />
      <Win x={428} y={298} w={11} h={15} o={0.65} />
      <Win x={1000} y={298} w={11} h={15} o={0.75} />
      <Win x={1020} y={298} w={11} h={15} o={0.68} />
      {/* Curtain / courtyard */}
      <Win x={498} y={348} w={9} h={13} o={0.55} />
      <Win x={530} y={348} w={9} h={13} o={0.5} />
      <Win x={900} y={348} w={9} h={13} o={0.58} />
      <Win x={932} y={348} w={9} h={13} o={0.5} />
      <Win x={640} y={328} w={9} h={13} o={0.55} />
      <Win x={790} y={328} w={9} h={13} o={0.55} />

      {/* Night mist: the base settles softly into the hills instead of a hard edge. */}
      <rect x="160" y="385" width="1120" height="75" fill={url("mist")} />
      <ellipse cx="720" cy="458" rx="420" ry="26" fill="#12081f" opacity="0.4" />
      {/* Keep the gate's glow above the mist */}
      <ellipse cx="720" cy="456" rx="60" ry="9" fill={url("spill")} />
    </svg>
  );
}

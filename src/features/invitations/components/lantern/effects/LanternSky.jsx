'use client';

import { useEffect, useRef } from 'react';
import './LanternSky.css';

const MAX_LAYERS = 6;
const MAX_COLORS = 4;
const INTRO_SECONDS = 2.2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform float uDepth;
uniform float uDensity;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlow;
uniform float uLanternSize;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

float sdEllipse(vec2 p, vec2 ab) {
  p = abs(p);
  float k0 = length(p / ab);
  float k1 = length(p / (ab * ab));
  return k0 * (k0 - 1.0) / max(k1, 0.001);
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 pickColor(vec2 si, float seed) {
#ifdef PALETTE
  float pick = Hash21(si + 7.0) * float(uColorCount);
  return uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
  return mix(vec3(1.0, 0.72, 0.28), vec3(1.0, 0.95, 0.72), 0.5 + 0.5 * seed);
#endif
}

/* Tangled festival lantern — cylinder, yellow→peach paper, dark-red sun crest */
vec3 Lantern(vec2 uv, float size, float flame, vec3 base) {
  float s = max(size, 0.35);

  // Vertical paper cylinder with rounded crown/base
  float body = sdRoundedBox(uv, vec2(0.082, 0.135) * s, 0.055 * s);
  float bodyMask = smoothstep(0.007, -0.003, body);

  float glow = exp(-max(body, 0.0) * (20.0 / max(uGlow, 0.2))) * 0.26 * uGlow;

  // Bamboo rims
  float topRim = sdRoundedBox(uv - vec2(0.0, 0.142 * s), vec2(0.052, 0.012) * s, 0.005 * s);
  float botRim = sdRoundedBox(uv - vec2(0.0, -0.142 * s), vec2(0.056, 0.012) * s, 0.005 * s);
  float rimMask = max(smoothstep(0.006, -0.002, topRim), smoothstep(0.006, -0.002, botRim));

  // Decorative vine bands (approx) near top & bottom
  float bandTop = smoothstep(0.012 * s, 0.0, abs(uv.y - 0.09 * s)) * bodyMask;
  float bandBot = smoothstep(0.012 * s, 0.0, abs(uv.y + 0.09 * s)) * bodyMask;
  float wave = 0.5 + 0.5 * sin(uv.x * (48.0 / max(s, 0.001)) + uv.y * 10.0);
  float bands = (bandTop + bandBot) * (0.35 + 0.45 * wave);

  // Dark reddish sun crest with wavy flame rays
  vec2 su = uv / max(s, 0.001);
  float ang = atan(su.y, su.x);
  float rad = length(su);
  float sunCore = smoothstep(0.048, 0.0, rad);
  // Wavy ray lobes (flame-like, not straight spikes)
  float rayWave = sin(ang * 8.0 + 0.6 * sin(ang * 3.0));
  float rays = pow(max(rayWave, 0.0), 3.5) * smoothstep(0.14, 0.04, rad) * smoothstep(0.02, 0.05, rad);
  float sun = (sunCore * 0.95 + rays * 0.85) * bodyMask;

  // Bottom flame wash
  vec2 flameUv = uv - vec2(0.0, -0.09 * s);
  flameUv.x *= 1.0 + 0.1 * sin(flame * 6.2831);
  float flameMask = smoothstep(1.0, 0.2, length(flameUv / (vec2(0.042, 0.05) * s)));
  flameMask *= (0.4 + 0.6 * flame) * bodyMask * smoothstep(0.0, -0.14 * s, uv.y);

  // Paper: bright yellow near open bottom → peach/orange at top
  float belly = smoothstep(0.12 * s, -0.14 * s, uv.y);
  vec3 peach = vec3(0.91, 0.54, 0.29);
  vec3 gold = vec3(1.0, 0.83, 0.35);
  vec3 paper = mix(peach, gold, belly);
  paper = mix(paper, vec3(1.0, 0.95, 0.7), flameMask * 0.5);

  vec3 crest = vec3(0.60, 0.18, 0.11);
  vec3 bandCol = mix(vec3(0.60, 0.18, 0.11), vec3(0.77, 0.35, 0.18), bandBot);
  vec3 wood = vec3(0.48, 0.25, 0.09);

  vec3 col = paper * bodyMask;
  col = mix(col, crest, sun * 0.92);
  col = mix(col, bandCol, bands * 0.7);
  col += gold * glow;
  col = mix(col, wood, rimMask * 0.95);

  float alpha = max(bodyMask, max(glow * 0.5, rimMask));
  return col * alpha;
}

vec3 LanternLayer(vec2 uv, float aspect, float layerSeed, float depth) {
  vec3 col = vec3(0.0);
  float cols = max(mix(12.0, 5.0, depth) * uDensity, 3.0);
  float colF = (uv.x / max(aspect, 0.001) + 0.5) * cols;
  float colId = floor(colF);

  for (int i = -1; i <= 1; i++) {
    float id = colId + float(i);
    float seed = Hash21(vec2(id, layerSeed * 13.7));
    float seed2 = Hash21(vec2(id + 19.0, layerSeed * 5.3));

    for (int n = 0; n < 2; n++) {
      float nF = float(n);
      float nSeed = Hash21(vec2(id, layerSeed + nF * 31.0));
      if (n == 1 && nSeed < 0.55) continue;

      float size = (0.65 + 0.7 * fract(seed * (11.0 + nF))) * uLanternSize * mix(0.6, 1.1, depth);
      float riseSpeed = (0.042 + 0.032 * fract(seed2 * (7.0 + nF))) * uSpeed;
      float rise = fract(seed + nSeed * 0.37 + uTime * riseSpeed);

      float y = mix(-0.7, 0.74, rise);
      float sway = sin(uTime * (0.35 + seed) + seed * 6.2831 + nF) * 0.032;
      float cx = ((id + 0.5) / cols - 0.5) * aspect;
      cx += (fract(seed * 41.0) - 0.5) * (aspect / cols) * 0.45 + sway;
      vec2 local = uv - vec2(cx, y);

#ifdef REPEL
      float dist = length(local);
      float push = uRepulsionStrength * 0.04 * uMouseActiveFactor * exp(-dist * dist * 14.0);
      local -= local * (push / max(dist, 0.0001));
#endif

      float life = smoothstep(0.0, 0.07, rise) * (1.0 - smoothstep(0.9, 1.0, rise));
      // Soften center so couple names stay readable
      float centerClear = 1.0 - smoothstep(0.22, 0.0, abs(cx)) * 0.62 * smoothstep(0.38, 0.02, abs(y));
      float flame = tris(uTime * (1.4 + seed) + seed * 4.0 + nF);
      float twinkle = mix(1.0, trisn(uTime * 0.65 + seed * 6.2831) * 0.5 + 1.0, uTwinkleIntensity * 0.3);
      vec3 base = pickColor(vec2(id, nF), seed);
      col += Lantern(local, size, flame, base) * twinkle * life * centerClear * (0.55 + 0.4 * seed);
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;

  if (uMouseRepulsion < 0.5 && uAutoCenterRepulsion <= 0.0) {
    uv += (uMouse - vec2(0.5)) * 0.04 * uMouseActiveFactor;
  }

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${MAX_LAYERS}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / max(layers, 1.0);
    float depth = fract(i + uDepth * 0.12);
    float fade = mix(0.4, 0.95, depth);
    col += LanternLayer(uv, aspect, i * 17.0 + 3.0, depth) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.25, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.2, 1.0), 1.2) * 0.9 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.25, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const keyOf = (palette, repel) => (palette ? 2 : 0) + (repel ? 1 : 0);

const start = (gl, palette, repel) => {
  const defines = `${palette ? '#define PALETTE\n' : ''}${repel ? '#define REPEL\n' : ''}`;
  const program = gl.createProgram();
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vertex || !fragment) return null;
  gl.shaderSource(vertex, VERTEX);
  gl.shaderSource(fragment, FRAGMENT.replace('\n', `\n${defines}`));
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
};

const finish = (gl, program) => {
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};

/** @type {(props?: Record<string, any>) => any} */
const LanternSky = ({
  focal = [0.5, 0.5],
  density = 1,
  disableAnimation = false,
  speed = 0.95,
  mouseInteraction = true,
  glowIntensity = 0.95,
  mouseRepulsion = true,
  repulsionStrength = 1.5,
  twinkleIntensity = 0.32,
  autoCenterRepulsion = 0,
  transparent = false,
  lightMode = false,
  lanternColors,
  lanternSize = 1,
  layers = 4,
  intro = true,
  backgroundColor = '#0d0720',
  opacity = 1,
  dpr,
  className = '',
  style,
  ...rest
} = {}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wakeRef = useRef(null);
  const palette = Array.isArray(lanternColors) ? lanternColors.filter(Boolean).slice(0, MAX_COLORS) : [];
  const settings = {
    focal: Array.isArray(focal) ? focal : [0.5, 0.5],
    density: Math.max(0.01, density),
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity: Math.max(0, glowIntensity),
    mouseRepulsion,
    repulsionStrength,
    twinkleIntensity: clamp(twinkleIntensity, 0, 1),
    autoCenterRepulsion: Math.max(0, autoCenterRepulsion),
    transparent,
    lightMode,
    palette,
    lanternSize: Math.max(0.2, lanternSize),
    layers: clamp(Math.round(layers), 2, MAX_LAYERS),
    intro,
    backgroundColor,
    opacity: clamp(opacity, 0, 1),
    dpr
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!container || !canvas || !gl) return undefined;

    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const programs = new Map();
    const entry = (paletteOn, repel) => {
      const key = keyOf(paletteOn, repel);
      let found = programs.get(key);
      if (!found) {
        found = { program: start(gl, paletteOn, repel), linked: null, done: false };
        programs.set(key, found);
      }
      return found;
    };
    const variant = (paletteOn, repel, wait) => {
      const found = entry(paletteOn, repel);
      if (!found.done && found.program) {
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;
        found.linked = finish(gl, found.program);
        found.done = true;
      }
      return found.linked;
    };
    const initial = settingsRef.current;
    if (!variant(initial.palette.length > 0, false, true)) {
      programs.forEach(found => found.program && gl.deleteProgram(found.program));
      return undefined;
    }

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const cache = new Map();
    const parse = (value, fallback) => {
      if (!value) return fallback;
      const key = String(value);
      if (cache.has(key)) return cache.get(key);
      let rgb = fallback;
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#000000';
        probe.fillStyle = key;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      cache.set(key, rgb);
      return rgb;
    };
    const colors = new Float32Array(MAX_COLORS * 3);

    const pointer = { x: 0.5, y: 0.5, inside: false };
    const state = {
      time: 0,
      depth: 0,
      mx: 0.5,
      my: 0.5,
      active: 0,
      reveal: settingsRef.current.intro && !reduce ? 0 : 1
    };
    let raf = 0;
    let last = 0;
    let visible = true;

    const render = () => {
      const s = settingsRef.current;
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 0.85, 0.45]), index * 3));
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;
      const background = parse(s.backgroundColor, [0.05, 0.027, 0.125]);
      const paletteOn = s.palette.length > 0;
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);
      const base = variant(paletteOn, false, true);
      if (!base) return;
      const program = (repel ? variant(paletteOn, true, false) : null) ?? base;
      const u = program.uniforms;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program.program);
      gl.bindVertexArray(vao);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);
      gl.uniform1f(u.uDepth, state.depth);
      gl.uniform1f(u.uDensity, s.density);
      gl.uniform1f(u.uSpeed, s.speed);
      gl.uniform2f(u.uMouse, state.mx, state.my);
      gl.uniform1f(u.uGlow, Math.max(0.15, s.glowIntensity));
      gl.uniform1f(u.uLanternSize, s.lanternSize);
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);
      gl.uniform1f(u.uMouseActiveFactor, state.active);
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);
      gl.uniform1i(u.uLayers, s.layers);
      gl.uniform3fv(u.uColors, colors);
      gl.uniform1i(u.uColorCount, s.palette.length);
      const fade = Math.min(1, state.reveal / 0.35);
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));
      gl.uniform1f(u.uMode, mode);
      gl.uniform3fv(u.uBackground, background);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = now => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
      last = now;
      const motion = s.disableAnimation || reduce ? 0 : 1;
      if (s.intro && !reduce && state.reveal < 1) {
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);
      } else if (!s.intro || reduce) {
        state.reveal = 1;
      }
      state.time += dt * motion;
      state.depth += dt * 0.015 * s.speed * motion;

      const follow = 1 - Math.exp(-dt / 0.325);
      const engaged = s.mouseInteraction && pointer.inside && !reduce;
      if (engaged) {
        state.mx += (pointer.x - state.mx) * follow;
        state.my += (pointer.y - state.my) * follow;
      }
      const target = engaged ? 1 : 0;
      state.active += (target - state.active) * follow;
      if (Math.abs(target - state.active) < 0.001) state.active = target;

      render();
      const busy = motion > 0 || state.active !== target || state.reveal < 1;
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const s = settingsRef.current;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      render();
      wake();
    };

    const locate = event => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x / Math.max(1, rect.width);
      pointer.y = 1 - y / Math.max(1, rect.height);
    };

    const onPointerMove = event => {
      locate(event);
      wake();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          last = 0;
          if (state.reveal < 0.15) state.reveal = Math.max(state.reveal, 0.35);
          resize();
          wake();
        }
      },
      { rootMargin: '15% 0px' },
    );
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();

    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);
    if (repelling) entry(initial.palette.length > 0, true);

    let lastDpr = settingsRef.current.dpr;
    wakeRef.current = () => {
      const s = settingsRef.current;
      if (s.dpr !== lastDpr) {
        lastDpr = s.dpr;
        resize();
        return;
      }
      if (!raf) render();
      wake();
    };

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      programs.forEach(found => found.program && gl.deleteProgram(found.program));
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      // Do not call WEBGL_lose_context.loseContext() — React Strict Mode
      // remounts effects on the same canvas, and a lost context cannot be
      // reacquired with getContext("webgl2"), leaving the sky blank.
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div ref={containerRef} className={`lantern-sky-container${className ? ` ${className}` : ''}`} style={style} {...rest}>
      <canvas ref={canvasRef} className="lantern-sky-canvas" aria-hidden="true" />
    </div>
  );
};

export default LanternSky;

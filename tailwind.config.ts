import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Lantern invite palette (namespaced to avoid clashing with Tailwind/defaults) */
        night: "var(--color-night)",
        dusk: "var(--color-dusk)",
        twilight: "var(--color-twilight)",
        corona: "var(--color-corona)",
        lantern: {
          DEFAULT: "var(--color-lantern)",
          soft: "var(--color-lantern-soft)",
          glow: "var(--color-lantern-glow)",
          rose: "var(--color-rose)",
        },
        blush: "var(--color-blush)",
        petal: "var(--color-petal)",
        cream: {
          DEFAULT: "var(--color-cream)",
          dark: "var(--color-cream-dark)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          light: "var(--color-ink-light)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        cinzel: ["var(--font-cinzel)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "lantern-rise": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0" },
          "8%": { opacity: "var(--lantern-opacity, 0.7)" },
          "88%": { opacity: "var(--lantern-opacity, 0.7)" },
          "100%": {
            transform: "translate3d(var(--lantern-drift, 0px), -135vh, 0)",
            opacity: "0",
          },
        },
        "lantern-sway": {
          "0%, 100%": { transform: "rotate(calc(var(--lantern-sway, 4deg) * -1))" },
          "50%": { transform: "rotate(var(--lantern-sway, 4deg))" },
        },
        "lantern-flame": {
          "0%, 100%": { transform: "scale(1, 1)", opacity: "0.9" },
          "25%": { transform: "scale(0.94, 1.12)", opacity: "1" },
          "50%": { transform: "scale(1.06, 0.94)", opacity: "0.88" },
          "75%": { transform: "scale(0.97, 1.08)", opacity: "1" },
        },
        "lantern-twinkle": {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "lantern-firefly-drift": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "25%": { transform: "translate3d(14px, -18px, 0)" },
          "50%": { transform: "translate3d(-10px, -30px, 0)" },
          "75%": { transform: "translate3d(8px, -14px, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        "lantern-firefly-twinkle": {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.7)" },
          "45%": { opacity: "1", transform: "scale(1.15)" },
          "70%": { opacity: "0.35", transform: "scale(0.9)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "lantern-rise": "lantern-rise linear forwards",
        "lantern-sway": "lantern-sway ease-in-out infinite",
        "lantern-flame": "lantern-flame ease-in-out infinite",
        "lantern-twinkle": "lantern-twinkle ease-in-out infinite",
        "lantern-firefly-drift": "lantern-firefly-drift ease-in-out infinite",
        "lantern-firefly-twinkle": "lantern-firefly-twinkle ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

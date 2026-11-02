import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required: a stray package-lock.json in the home folder otherwise becomes
  // Turbopack's workspace root, which breaks the React Client Manifest
  // (global-error / error.tsx "Could not find the module" errors).
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [72, 75, 78, 80, 82],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      // Prevent CSRF false-rejects (and some hosts reporting 404) when
      // production is reached via custom domain / www / preview URLs.
      allowedOrigins: [
        ...new Set(
          [
            process.env.NEXT_PUBLIC_APP_URL,
            process.env.NEXTAUTH_URL,
            process.env.AUTH_URL,
            process.env.NEXT_PUBLIC_RSVP_APP_URL,
            process.env.RSVP_ALLOWED_ORIGIN,
          ]
            .filter(Boolean)
            .flatMap((value) => String(value).split(","))
            .map((value) => {
              try {
                return new URL(value.trim()).host;
              } catch {
                return value.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
              }
            })
            .filter(Boolean),
        ),
      ],
    },
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        // camera=(self) required for guest check-in scanner on /check-in/*
        value: "camera=(self), microphone=(), geolocation=(self)",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

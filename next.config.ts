import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/* Response headers for every route. No strict Content-Security-Policy yet: Next and the
   Payload admin need inline scripts, so a nonce-based CSP is a follow-up. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/* next/image only optimises hosts it knows. Add the bucket host when uploads move to Supabase Storage. */
const remotePatterns = process.env.NEXT_PUBLIC_MEDIA_HOST
  ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_MEDIA_HOST }]
  : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withPayload(nextConfig);

import { createNeonAuth } from "@neondatabase/auth/next/server";

// Build-safe defaults: real values come from .env.local / Vercel env.
// Without these, `next build` page-data collection would throw at import time.
const baseUrl =
  process.env.NEON_AUTH_BASE_URL ?? "http://localhost:3000/api/auth-placeholder";
const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ?? "build-time-placeholder-secret-32-chars-minimum!!";

if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
  console.warn(
    "[auth] NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET not set — using build placeholder. Set them in .env.local."
  );
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
});

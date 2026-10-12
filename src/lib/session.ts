import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Stateless admin session: "<expiresAtMs>.<hmac>" signed with ADMIN_SESSION_SECRET.
// Rotating the secret or the password signs every admin out.

export const SESSION_COOKIE = "cs_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }
  // Mix the password in so changing it invalidates existing sessions
  return `${s}:${process.env.ADMIN_PASSWORD ?? ""}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so lengths always match and nothing leaks through timing
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function createSessionToken() {
  const expires = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  try {
    if (!safeEqual(signature, sign(expires))) return false;
  } catch {
    return false;
  }
  return Number(expires) > Date.now();
}

export function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

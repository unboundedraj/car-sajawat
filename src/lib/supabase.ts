import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const MEDIA_BUCKET = "media";

export function isSupabaseConfigured() {
  return Boolean(url && publishableKey);
}

export function isAdminStorageConfigured() {
  return Boolean(url && secretKey);
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

/** Read-only client restricted by RLS. Safe for public pages. */
export function publicDb() {
  if (!url || !publishableKey) return null;
  return createClient(url, publishableKey, clientOptions);
}

/** Full-access client. Only call after verifying the admin session. */
export function adminDb() {
  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.",
    );
  }
  return createClient(url, secretKey, clientOptions);
}

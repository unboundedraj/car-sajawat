"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createUploadUrl } from "@/app/admin/actions";

let browserClient: SupabaseClient | null = null;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase isn't configured (NEXT_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY).");
  browserClient ??= createClient(url, key, { auth: { persistSession: false } });
  return browserClient;
}

export const MAX_UPLOAD_MB = 50;

/**
 * Uploads straight from the browser to Supabase Storage using a one-time
 * signed URL minted by a Server Action, so large videos never pass through
 * (or hit the body-size limits of) our own server.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB. Compress it or use a YouTube link instead.`);
  }
  const signed = await createUploadUrl(file.name, file.type, folder);
  if (!signed.ok) throw new Error(signed.error);
  const { path, token, publicUrl } = signed.data!;
  const { error } = await client().storage.from("media").uploadToSignedUrl(path, token, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(error.message);
  return publicUrl;
}

"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import {
  catalogSchema,
  categorySchema,
  contentSchemas,
  mediaSchema,
  offerSchema,
  teamSchema,
} from "@/lib/schemas";
import { MEDIA_BUCKET, adminDb } from "@/lib/supabase";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkAdminPassword,
  createSessionToken,
} from "@/lib/session";
import type { EnquiryStatus, SiteContentKey } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error:
    error instanceof z.ZodError
      ? error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; ")
      : error instanceof Error
        ? error.message
        : String(error),
});

// ── Auth ────────────────────────────────────────────────────

// Best-effort brute-force throttle (per server instance)
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const entry = attempts.get(ip);
  if (entry && entry.count >= 5 && entry.until > Date.now()) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD is not configured on the server." };
  }
  if (!checkAdminPassword(password)) {
    const count = (entry && entry.until > Date.now() ? entry.count : 0) + 1;
    attempts.set(ip, { count, until: Date.now() + 10 * 60 * 1000 });
    return { error: "Incorrect password." };
  }
  attempts.delete(ip);

  let token: string;
  try {
    token = createSessionToken();
  } catch (e) {
    return { error: (e as Error).message };
  }

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Helpers ─────────────────────────────────────────────────

function done(tag: string) {
  updateTag(tag);
  refresh();
}

/** Best-effort cleanup of files we uploaded to our own bucket. */
async function removeStorageFiles(urls: (string | null | undefined)[]) {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const paths = urls
    .filter((u): u is string => !!u && u.includes(marker))
    .map((u) => decodeURIComponent(u.split(marker)[1].split("?")[0]));
  if (paths.length === 0) return;
  const { error } = await adminDb().storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.error("[admin] storage cleanup:", error.message);
}

const nullIfEmpty = <T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]) => {
  const copy = { ...obj };
  for (const k of keys) if (copy[k] === "") (copy as Record<keyof T, unknown>)[k] = null;
  return copy;
};

// ── Uploads ─────────────────────────────────────────────────

const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm|quicktime))$/;

/** Returns a one-time signed URL; the browser uploads straight to Supabase Storage. */
export async function createUploadUrl(
  fileName: string,
  contentType: string,
  folder: string,
): Promise<ActionResult<{ path: string; token: string; publicUrl: string }>> {
  await requireAdmin();
  try {
    if (!ALLOWED_TYPES.test(contentType)) throw new Error(`Unsupported file type: ${contentType}`);
    const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const base = slugify(fileName.replace(/\.[^.]+$/, "")) || "file";
    const path = `${slugify(folder) || "misc"}/${base}-${randomUUID().slice(0, 8)}.${ext}`;

    const storage = adminDb().storage.from(MEDIA_BUCKET);
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error) throw error;
    const publicUrl = storage.getPublicUrl(path).data.publicUrl;
    return { ok: true, data: { path: data.path, token: data.token, publicUrl } };
  } catch (e) {
    return fail(e);
  }
}

// ── Site content ────────────────────────────────────────────

export async function saveContent(key: SiteContentKey, value: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const schema = contentSchemas[key];
    if (!schema) throw new Error(`Unknown section: ${key}`);
    const parsed = schema.parse(value);
    const { error } = await adminDb()
      .from("site_content")
      .upsert({ key, value: parsed, updated_at: new Date().toISOString() });
    if (error) throw error;
    done(TAGS.content);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Offers (CTA strip) ──────────────────────────────────────

export async function saveOffer(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { id, ...rest } = offerSchema.parse(input);
    const row = nullIfEmpty(rest, ["badge", "link_url"]);
    const db = adminDb().from("offers");
    const { error } = id ? await db.update(row).eq("id", id) : await db.insert(row);
    if (error) throw error;
    done(TAGS.offers);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { error } = await adminDb().from("offers").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    done(TAGS.offers);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Categories ──────────────────────────────────────────────

export async function saveCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    const { id, ...rest } = categorySchema.parse(input);
    const row = { ...nullIfEmpty(rest, ["description"]), slug: rest.slug || slugify(rest.name) };
    const db = adminDb().from("categories");
    const { data, error } = id
      ? await db.update(row).eq("id", id).select("id").single()
      : await db.insert(row).select("id").single();
    if (error) {
      if (error.code === "23505") throw new Error(`A ${row.kind} category called "${row.name}" already exists.`);
      throw error;
    }
    done(TAGS.catalog);
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return fail(e);
  }
}

/** Items in a deleted category stay, but show as "Other" until reassigned. */
export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { error } = await adminDb().from("categories").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    done(TAGS.catalog);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Catalog (services & products) ───────────────────────────

export async function saveCatalogItem(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { id, ...rest } = catalogSchema.parse(input);
    const row = {
      ...nullIfEmpty(rest, ["tagline", "description", "price_note", "cover_image"]),
      slug: rest.slug || slugify(rest.name),
      images: rest.images.filter(Boolean),
      videos: rest.videos.filter(Boolean),
      features: rest.features.filter(Boolean),
      updated_at: new Date().toISOString(),
    };
    const db = adminDb().from("catalog_items");
    const { error } = id ? await db.update(row).eq("id", id) : await db.insert(row);
    if (error) {
      if (error.code === "23505") throw new Error(`The URL slug "${row.slug}" is already used by another item.`);
      throw error;
    }
    done(TAGS.catalog);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCatalogItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = adminDb();
    const { data, error } = await db
      .from("catalog_items")
      .delete()
      .eq("id", z.uuid().parse(id))
      .select("cover_image, images, videos")
      .single();
    if (error) throw error;
    await removeStorageFiles([data.cover_image, ...data.images, ...data.videos]);
    done(TAGS.catalog);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Gallery media ───────────────────────────────────────────

export async function saveMedia(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { id, ...row } = mediaSchema.parse(input);
    const db = adminDb().from("media_assets");
    const { error } = id ? await db.update(row).eq("id", id) : await db.insert(row);
    if (error) throw error;
    done(TAGS.media);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { data, error } = await adminDb()
      .from("media_assets")
      .delete()
      .eq("id", z.uuid().parse(id))
      .select("url")
      .single();
    if (error) throw error;
    await removeStorageFiles([data.url]);
    done(TAGS.media);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Team ────────────────────────────────────────────────────

export async function saveTeamMember(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { id, ...rest } = teamSchema.parse(input);
    const row = nullIfEmpty(rest, ["bio", "photo_url"]);
    const db = adminDb().from("team_members");
    const { error } = id ? await db.update(row).eq("id", id) : await db.insert(row);
    if (error) throw error;
    done(TAGS.team);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { data, error } = await adminDb()
      .from("team_members")
      .delete()
      .eq("id", z.uuid().parse(id))
      .select("photo_url")
      .single();
    if (error) throw error;
    await removeStorageFiles([data.photo_url]);
    done(TAGS.team);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ── Enquiries ───────────────────────────────────────────────

export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { error } = await adminDb()
      .from("enquiries")
      .update({ status: z.enum(["new", "contacted", "closed"]).parse(status) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { error } = await adminDb().from("enquiries").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_CONTENT } from "./defaults";
import { publicDb } from "./supabase";
import type { CatalogItem, Category, MediaAsset, Offer, SiteContent, SiteContentKey, TeamMember } from "./types";

// Cache tags, invalidated from admin Server Actions with updateTag()
export const TAGS = {
  content: "site-content",
  offers: "offers",
  catalog: "catalog",
  media: "media",
  team: "team",
} as const;

/** Stored JSON is merged over defaults so new fields never render as undefined. */
export function mergeContent(rows: { key: string; value: unknown }[]): SiteContent {
  const merged = structuredClone(DEFAULT_CONTENT);
  for (const row of rows) {
    const key = row.key as SiteContentKey;
    if (key in merged && row.value && typeof row.value === "object") {
      Object.assign(merged[key], row.value);
    }
  }
  return merged;
}

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.content);

  const db = publicDb();
  if (!db) return DEFAULT_CONTENT;
  const { data, error } = await db.from("site_content").select("key, value");
  if (error) {
    console.error("[data] site_content:", error.message);
    return DEFAULT_CONTENT;
  }
  return mergeContent(data ?? []);
}

export async function getActiveOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.offers);

  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    console.error("[data] offers:", error.message);
    return [];
  }
  return data ?? [];
}

/** Select + mapper shared with the admin reads: flattens the joined category name. */
export const CATALOG_SELECT = "*, categories(name)";
export function toCatalogItem(row: Record<string, unknown>): CatalogItem {
  const { categories, ...rest } = row as CatalogItem & { categories: { name: string } | null };
  return { ...rest, category: categories?.name ?? "Other" };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.catalog);

  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db.from("categories").select("*").order("kind").order("sort_order").order("name");
  if (error) {
    console.error("[data] categories:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCatalog(): Promise<CatalogItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.catalog);

  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("catalog_items")
    .select(CATALOG_SELECT)
    .eq("is_active", true)
    .order("kind")
    .order("sort_order");
  if (error) {
    console.error("[data] catalog_items:", error.message);
    return [];
  }
  return (data ?? []).map(toCatalogItem);
}

export async function getCatalogItem(slug: string): Promise<CatalogItem | null> {
  const items = await getCatalog();
  return items.find((item) => item.slug === slug) ?? null;
}

export async function getMedia(): Promise<MediaAsset[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.media);

  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("media_assets")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[data] media_assets:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.team);

  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    console.error("[data] team_members:", error.message);
    return [];
  }
  return data ?? [];
}

/** Footer copyright year without making the page dynamic */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

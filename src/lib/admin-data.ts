import "server-only";
import { requireAdmin } from "./auth";
import { CATALOG_SELECT, mergeContent, toCatalogItem } from "./data";
import { adminDb } from "./supabase";
import type { Category, Enquiry, MediaAsset, Offer, SiteContent, TeamMember } from "./types";

// Uncached, full-access reads for the admin panel. Each one re-checks the session.

async function select<T>(table: string, order: [string, boolean][], columns = "*"): Promise<T[]> {
  await requireAdmin();
  let q = adminDb().from(table).select(columns);
  for (const [col, ascending] of order) q = q.order(col, { ascending });
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

export async function adminGetContent(): Promise<SiteContent> {
  await requireAdmin();
  const { data, error } = await adminDb().from("site_content").select("key, value");
  if (error) throw new Error(`site_content: ${error.message}`);
  return mergeContent(data ?? []);
}

export const adminGetOffers = () => select<Offer>("offers", [["sort_order", true]]);
export const adminGetCategories = () => select<Category>("categories", [["kind", true], ["sort_order", true], ["name", true]]);
export const adminGetCatalog = async () =>
  (await select<Record<string, unknown>>("catalog_items", [["kind", true], ["sort_order", true]], CATALOG_SELECT)).map(toCatalogItem);
export const adminGetMedia = () => select<MediaAsset>("media_assets", [["sort_order", true], ["created_at", false]]);
export const adminGetTeam = () => select<TeamMember>("team_members", [["sort_order", true]]);
export const adminGetEnquiries = () => select<Enquiry>("enquiries", [["created_at", false]]);

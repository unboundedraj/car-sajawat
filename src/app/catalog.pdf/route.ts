import { connection } from "next/server";
import { renderCatalogPdf } from "@/lib/catalog-pdf";
import { getCatalog, getCategories, getSiteContent } from "@/lib/data";

// Generated on request from the (cached) catalogue, so admin edits show up immediately.
export async function GET() {
  await connection();
  const [items, categories, { contact }] = await Promise.all([getCatalog(), getCategories(), getSiteContent()]);

  const pdf = await renderCatalogPdf({
    items,
    categories,
    contact,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  });

  const filename = `${contact.businessName.replace(/[^a-z0-9]+/gi, "-")}-Catalogue.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

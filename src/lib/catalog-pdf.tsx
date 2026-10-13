import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Circle, Document, Font, Image, Link, Page, Path, Rect, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import sharp from "sharp";
import { BRAND_TAGLINE } from "./brand";
import { formatPrice } from "./price";
import type { CatalogItem, CatalogKind, Category, ContactContent } from "./types";
import { formatPhone, mapDirectionsUrl } from "./utils";

// Fonts are vendored in /assets/fonts (see outputFileTracingIncludes in next.config.ts).
// Manrope's latin subset has no ₹ glyph, so the rupee sign uses the latin-ext file.
const font = (file: string) => path.join(process.cwd(), "assets", "fonts", file);
Font.register({
  family: "Manrope",
  fonts: [
    { src: font("manrope-latin-400-normal.woff"), fontWeight: 400 },
    { src: font("manrope-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.register({
  family: "Rupee",
  fonts: [
    { src: font("manrope-latin-ext-400-normal.woff"), fontWeight: 400 },
    { src: font("manrope-latin-ext-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.register({
  family: "Oswald",
  fonts: [
    { src: font("oswald-latin-500-normal.woff"), fontWeight: 500 },
    { src: font("oswald-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.register({ family: "Syncopate", src: font("syncopate-latin-700-normal.woff"), fontWeight: 700 });
// Logo as raw bytes: a bare Windows path (E:...) would be treated as a URL and fetched
const LOGO = { data: readFileSync(path.join(process.cwd(), "public", "logo.png")), format: "png" as const };

// Never hyphenate words across lines
Font.registerHyphenationCallback((word) => [word]);

// Same palette as the website (navy depth, gold highlights, red brand accent)
const C = {
  navy: "#0d1b3e",
  navy2: "#1a3270",
  gold: "#b8901f",
  goldBright: "#e2bd55",
  cream: "#fbf7ec",
  ink: "#0a1022",
  muted: "#5b6475",
  line: "#e3e6ee",
  soft: "#f3f5f9",
  red: "#d6152a",
  white: "#ffffff",
};

const PAD = 42;

const s = StyleSheet.create({
  page: { fontFamily: "Manrope", fontSize: 9.5, color: C.ink, paddingTop: 54, paddingBottom: 70, paddingHorizontal: PAD, lineHeight: 1.5 },
  link: { textDecoration: "none" },

  // Running header (pages 2+) and footer (all pages)
  runHead: { position: "absolute", top: 22, left: PAD, right: PAD, fontSize: 7.5, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5 },
  footRule: { position: "absolute", left: PAD, right: PAD, bottom: 46, height: 1, backgroundColor: C.gold, opacity: 0.6 },
  footLeft: { position: "absolute", left: PAD, right: 140, bottom: 28, fontSize: 7.5, color: C.muted },
  // react-pdf drops bottom-anchored dynamic (render) text, so anchor from the top of the A4 page (842pt)
  footPage: { position: "absolute", left: PAD, right: PAD, top: 842 - 28 - 10, fontSize: 7.5, color: C.navy, textAlign: "right", fontWeight: 700 },

  // Cover
  cover: { backgroundColor: C.navy, color: C.white, marginHorizontal: -PAD, marginTop: -54, paddingHorizontal: PAD, paddingTop: 36, paddingBottom: 30, flexDirection: "row" },
  coverMain: { flex: 1.35, paddingRight: 24 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 54, height: 54, marginRight: 12 },
  // Wide face so the name spans the same width as the tagline
  brand: { fontFamily: "Syncopate", fontWeight: 700, fontSize: 21.3, textTransform: "uppercase", lineHeight: 1.3 },
  brandSub: { fontSize: 7.5, color: C.goldBright, letterSpacing: 1.8, textTransform: "uppercase", marginTop: 3, marginRight: -1.8, lineHeight: 1.3 },
  coverKicker: { fontSize: 8, color: C.goldBright, letterSpacing: 3, textTransform: "uppercase", marginTop: 26 },
  coverTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 32, textTransform: "uppercase", lineHeight: 1.3, marginTop: 6 },
  coverTag: { fontSize: 10, color: "#c8cfde", marginTop: 12, maxWidth: 300 },
  coverPanel: { flex: 1, borderLeftWidth: 1, borderLeftColor: "#33477a", paddingLeft: 18, justifyContent: "center" },
  panelLabel: { fontSize: 6.5, color: C.goldBright, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 700, marginTop: 9 },
  panelValue: { fontSize: 8.5, color: C.white, marginTop: 1.5, lineHeight: 1.4 },
  stripe: { flexDirection: "row", marginHorizontal: -PAD, height: 5 },

  // Intro note
  note: { flexDirection: "row", backgroundColor: C.cream, borderLeftWidth: 3, borderLeftColor: C.gold, padding: 10, marginTop: 20, borderRadius: 3 },
  noteText: { fontSize: 8.5, color: "#5a4a1c", flex: 1 },

  // Sections
  kindHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.navy, color: C.white, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, marginTop: 22, marginBottom: 4 },
  kindTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.3 },
  kindCount: { fontSize: 8, color: C.goldBright, letterSpacing: 1.2, textTransform: "uppercase" },
  catRow: { flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 2 },
  catBar: { width: 3, height: 13, backgroundColor: C.gold, marginRight: 7 },
  catName: { fontFamily: "Oswald", fontWeight: 500, fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.6, color: C.navy, lineHeight: 1.3 },
  catCount: { fontSize: 7.5, color: C.muted, marginLeft: 6 },
  catDesc: { color: C.muted, fontSize: 8.5, marginLeft: 10, marginBottom: 4 },

  // Item table: photo | details | estimated cost
  table: { borderWidth: 1, borderColor: C.line, borderRadius: 5, marginTop: 6 },
  tHead: { flexDirection: "row", backgroundColor: C.soft, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  th: { fontSize: 6.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1.2, paddingVertical: 5, paddingHorizontal: 8 },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.line },
  colPhoto: { width: 96, padding: 7 },
  colItem: { flex: 1, paddingVertical: 8, paddingHorizontal: 8 },
  colPrice: { width: 132, paddingVertical: 8, paddingHorizontal: 8, alignItems: "flex-end" },
  photo: { width: 82, height: 62, borderRadius: 3, objectFit: "cover" },
  noPhoto: { width: 82, height: 62, borderRadius: 3, backgroundColor: C.soft, alignItems: "center", justifyContent: "center" },
  noPhotoText: { fontSize: 6.5, color: C.muted, textTransform: "uppercase", letterSpacing: 1 },
  itemName: { fontWeight: 700, fontSize: 10.5, color: C.navy },
  tagline: { color: C.muted, fontSize: 8, marginTop: 1 },
  priceBox: { alignItems: "flex-end", borderWidth: 1, borderColor: "#ead9a6", backgroundColor: C.cream, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4 },
  priceLabel: { fontSize: 6, color: C.gold, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 },
  price: { fontWeight: 700, fontSize: 11, color: C.navy },
  priceNote: { fontSize: 7, color: C.muted },
  onRequest: { fontSize: 8, color: C.muted },
  desc: { marginTop: 4, fontSize: 8.5 },
  features: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  feature: { fontSize: 7.5, backgroundColor: C.soft, color: C.navy, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, marginRight: 4, marginBottom: 3 },
  itemLink: { fontSize: 7.5, color: C.gold, fontWeight: 700, marginTop: 4, textDecoration: "none" },

  // Closing contact block
  contact: { marginTop: 26, backgroundColor: C.navy, color: C.white, borderRadius: 8, padding: 22 },
  contactKicker: { fontSize: 7.5, color: C.goldBright, letterSpacing: 3, textTransform: "uppercase" },
  contactTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 20, textTransform: "uppercase", lineHeight: 1.3, marginTop: 4, marginBottom: 14 },
  contactGrid: { flexDirection: "row", flexWrap: "wrap" },
  contactCell: { width: "50%", marginBottom: 11, paddingRight: 12 },
  contactWide: { width: "100%", marginBottom: 11 },
  contactLabel: { fontSize: 6.5, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 },
  contactValue: { fontSize: 9.5, color: C.white, marginTop: 2, lineHeight: 1.45 },
  contactAction: { fontSize: 8, color: C.goldBright, marginTop: 3, fontWeight: 700, textDecoration: "none" },
  contactRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  iconBadge: { backgroundColor: C.navy2, borderWidth: 0.75, borderColor: "#5a6fa8", alignItems: "center", justifyContent: "center", marginRight: 7 },
  itemLinkRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  thanks: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#33477a", fontSize: 8.5, color: "#c8cfde" },
});

// ── Icons (Lucide shapes, ISC licence) drawn as PDF vectors ─────────────────
type IconName = "pin" | "phone" | "whatsapp" | "mail" | "instagram" | "facebook" | "globe" | "clock" | "directions" | "external";

function IconShapes({ name }: { name: IconName }) {
  switch (name) {
    case "pin":
      return (
        <>
          <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <Circle cx="12" cy="10" r="3" />
        </>
      );
    case "phone":
      return (
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      );
    case "whatsapp":
      return <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />;
    case "mail":
      return (
        <>
          <Rect x="2" y="4" width="20" height="16" rx="2" />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </>
      );
    case "instagram":
      return (
        <>
          <Rect x="2" y="2" width="20" height="20" rx="5" />
          <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <Path d="M17.5 6.5h.01" />
        </>
      );
    case "facebook":
      return <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />;
    case "globe":
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <Path d="M2 12h20" />
        </>
      );
    case "clock":
      return (
        <>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </>
      );
    case "directions":
      return <Path d="M3 11 22 2l-9 19-2-8-8-2z" />;
    case "external":
      return (
        <>
          <Path d="M15 3h6v6" />
          <Path d="M10 14 21 3" />
          <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </>
      );
  }
}

function Icon({ name, size = 9, color = C.goldBright }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <IconShapes name={name} />
    </Svg>
  );
}

/** Gold icon in a navy circle + the value; the whole row is a link when href is given */
function ContactRow({ icon, href, size = "md", children }: { icon: IconName; href?: string; size?: "sm" | "md"; children: ReactNode }) {
  const badge = size === "sm" ? 15 : 18;
  const textStyle = size === "sm" ? s.panelValue : s.contactValue;
  const content = (
    <View style={s.contactRow}>
      <View style={[s.iconBadge, { width: badge, height: badge, borderRadius: badge / 2 }]}>
        <Icon name={icon} size={badge * 0.52} />
      </View>
      <Text style={[textStyle, { flex: 1, marginTop: 0 }]}>{children}</Text>
    </View>
  );
  return href ? (
    <Link src={href} style={s.link}>
      {content}
    </Link>
  ) : (
    content
  );
}

/** Renders "₹" in the Rupee font and digits in Manrope */
function Price({ value }: { value: string }) {
  const parts = value.split("₹");
  return (
    <Text style={s.price}>
      {parts.map((p, i) => (
        <Text key={i}>
          {i > 0 && <Text style={{ fontFamily: "Rupee" }}>₹</Text>}
          {p}
        </Text>
      ))}
    </Text>
  );
}

/** "https://www.instagram.com/carsajawat.ulhasnagar/" → "@carsajawat.ulhasnagar" */
function socialHandle(url: string) {
  try {
    const first = new URL(url).pathname.split("/").filter(Boolean)[0];
    return first ? `@${first.replace(/^@/, "")}` : url;
  } catch {
    return url;
  }
}

type Photo = { data: Buffer; format: "jpg" };
type Photos = Map<string, Photo>;

const photoCache = new Map<string, Promise<Photo | null>>();

/** Item photo as a small JPEG (react-pdf only reads JPEG/PNG, and uploads may be WebP/AVIF). */
function loadPhoto(url: string): Promise<Photo | null> {
  const cached = photoCache.get(url);
  if (cached) return cached;
  const p = (async () => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length > 15 * 1024 * 1024) return null; // don't let one huge upload slow every download
      const data = await sharp(bytes)
        .rotate()
        .resize(328, 248, { fit: "cover" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 78 })
        .toBuffer();
      return { data, format: "jpg" as const };
    } catch {
      return null;
    }
  })();
  photoCache.set(url, p);
  // Retry a failed download next time instead of remembering the failure
  void p.then((r) => r || photoCache.delete(url));
  if (photoCache.size > 300) photoCache.delete(photoCache.keys().next().value!);
  return p;
}

const photoUrl = (i: CatalogItem) => i.cover_image || i.images[0] || null;

function Row({ item, photo, siteUrl }: { item: CatalogItem; photo: Photo | undefined; siteUrl: string | null }) {
  const price = formatPrice(item);
  return (
    <View style={s.tRow} wrap={false}>
      <View style={s.colPhoto}>
        {photo ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt
          <Image style={s.photo} src={photo} />
        ) : (
          <View style={s.noPhoto}>
            <Text style={s.noPhotoText}>No photo</Text>
          </View>
        )}
      </View>
      <View style={s.colItem}>
        <Text style={s.itemName}>{item.name}</Text>
        {item.tagline ? <Text style={s.tagline}>{item.tagline}</Text> : null}
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
        {item.features.length > 0 && (
          <View style={s.features}>
            {item.features.map((f) => (
              <Text key={f} style={s.feature}>
                {f}
              </Text>
            ))}
          </View>
        )}
        {siteUrl && (
          <Link src={`${siteUrl}/services/${item.slug}`} style={s.link}>
            <View style={s.itemLinkRow}>
              <Icon name="external" size={8} color={C.gold} />
              <Text style={[s.itemLink, { marginTop: 0, marginLeft: 4 }]}>View more photos & details online</Text>
            </View>
          </Link>
        )}
      </View>
      <View style={s.colPrice}>
        <View style={s.priceBox}>
          {price ? (
            <>
              <Text style={s.priceLabel}>Est. cost</Text>
              <Price value={price} />
              {item.price_note ? <Text style={s.priceNote}>{item.price_note}</Text> : null}
            </>
          ) : (
            <Text style={s.onRequest}>Price on request</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function TableHead() {
  return (
    <View style={s.tHead}>
      <Text style={[s.th, { width: 96 }]}>Photo</Text>
      <Text style={[s.th, { flex: 1 }]}>Item</Text>
      <Text style={[s.th, { width: 132, textAlign: "right" }]}>Price</Text>
    </View>
  );
}

function KindSection({
  kind,
  items,
  categories,
  photos,
  siteUrl,
}: {
  kind: CatalogKind;
  items: CatalogItem[];
  categories: Category[];
  photos: Photos;
  siteUrl: string | null;
}) {
  const ofKind = items.filter((i) => i.kind === kind);
  if (ofKind.length === 0) return null;
  const groups = [
    ...categories.filter((c) => c.kind === kind).map((c) => ({ name: c.name, description: c.description, items: ofKind.filter((i) => i.category_id === c.id) })),
    { name: "Other", description: null, items: ofKind.filter((i) => !i.category_id || !categories.some((c) => c.id === i.category_id)) },
  ].filter((g) => g.items.length > 0);

  return (
    <View>
      <View style={s.kindHead} minPresenceAhead={120}>
        <Text style={s.kindTitle}>{kind === "service" ? "Services" : "Products"}</Text>
        <Text style={s.kindCount}>
          {ofKind.length} {kind === "service" ? "service" : "product"}
          {ofKind.length === 1 ? "" : "s"} · {groups.length} categor{groups.length === 1 ? "y" : "ies"}
        </Text>
      </View>
      {groups.map((g) => {
        const row = (item: CatalogItem) => {
          const url = photoUrl(item);
          return <Row key={item.id} item={item} photo={url ? photos.get(url) : undefined} siteUrl={siteUrl} />;
        };
        return (
          <View key={g.name}>
            {/* Keep each category heading together with the table header and first row */}
            <View wrap={false} minPresenceAhead={80}>
              <View style={s.catRow}>
                <View style={s.catBar} />
                <Text style={s.catName}>{g.name}</Text>
                <Text style={s.catCount}>({g.items.length})</Text>
              </View>
              {g.description ? <Text style={s.catDesc}>{g.description}</Text> : null}
            </View>
            <View style={s.table}>
              <TableHead />
              {g.items.map(row)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export async function renderCatalogPdf({
  items,
  categories,
  contact,
  siteUrl: rawSiteUrl,
}: {
  items: CatalogItem[];
  categories: Category[];
  contact: ContactContent;
  siteUrl: string;
}) {
  // Don't print or link a localhost address in a document meant for customers
  const siteUrl = /localhost|127\.0\.0\.1/.test(rawSiteUrl) ? null : rawSiteUrl.replace(/\/$/, "");
  const site = siteUrl?.replace(/^https?:\/\//, "") ?? "";
  const phones = [contact.phone, contact.altPhone].filter(Boolean);
  const igHandle = contact.instagram ? socialHandle(contact.instagram) : "";
  const fbHandle = contact.facebook ? socialHandle(contact.facebook) : "";
  const directions = mapDirectionsUrl(contact.mapQuery || contact.address);
  const addressLines = contact.address.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // Printed as plain text: customers save or copy it (WhatsApp is only offered on the website's floating button)
  const mainNumber = formatPhone(contact.whatsapp);
  const hours = contact.hours.filter((h) => h.days.trim() || h.time.trim());

  const urls = [...new Set(items.map(photoUrl).filter((u): u is string => Boolean(u)))];
  const loaded = await Promise.all(urls.map(loadPhoto));
  const photos: Photos = new Map(urls.flatMap((u, i) => (loaded[i] ? [[u, loaded[i]] as const] : [])));

  // Cover panel (short) and closing block (complete), all as clickable links
  const quick = [
    contact.address && { label: "Visit", icon: "pin", value: contact.address, href: directions },
    phones[0] && { label: "Call", icon: "phone", value: phones[0], href: `tel:${phones[0].replace(/[^\d+]/g, "")}` },
    mainNumber && { label: "Phone", icon: "phone", value: mainNumber },
    contact.email && { label: "Email", icon: "mail", value: contact.email, href: `mailto:${contact.email}` },
    igHandle && { label: "Instagram", icon: "instagram", value: igHandle, href: contact.instagram },
  ].filter(Boolean) as { label: string; icon: IconName; value: string; href?: string }[];

  const footerLine = [contact.businessName, phones[0], mainNumber, contact.email, igHandle]
    .filter(Boolean)
    .join("   ·   ");
  const title = `${contact.businessName} – Products & Services Catalogue`;

  const doc = (
    <Document title={title} author={contact.businessName} subject="Products and services with estimated prices" creator={contact.businessName}>
      <Page size="A4" style={s.page}>
        {/* Running header from page 2 */}
        <Text
          style={s.runHead}
          fixed
          render={({ pageNumber }) => (pageNumber > 1 ? `${contact.businessName}  ·  Products & Services Catalogue` : "")}
        />
        {/* Footer on every page */}
        <View style={s.footRule} fixed />
        <Text style={s.footLeft} fixed>
          {footerLine}
        </Text>
        <Text style={s.footPage} fixed render={({ pageNumber }) => `Page ${pageNumber}`} />

        {/* Cover */}
        <View style={s.cover}>
          <View style={s.coverMain}>
            <View style={s.brandRow}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
              <Image style={s.logo} src={LOGO} />
              <View>
                <Text style={s.brand}>{contact.businessName}</Text>
                <Text style={s.brandSub}>{BRAND_TAGLINE}</Text>
              </View>
            </View>
            <Text style={s.coverKicker}>Catalogue</Text>
            <Text style={s.coverTitle}>Products &{"\n"}Services</Text>
            <Text style={s.coverTag}>{contact.tagline}</Text>
          </View>
          {quick.length > 0 && (
            <View style={s.coverPanel}>
              {quick.map((q) => (
                <View key={q.label}>
                  <Text style={s.panelLabel}>{q.label}</Text>
                  <ContactRow icon={q.icon} href={q.href} size="sm">
                    {q.value}
                  </ContactRow>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={s.stripe}>
          <View style={{ flex: 3, backgroundColor: C.gold }} />
          <View style={{ flex: 1, backgroundColor: C.red }} />
        </View>

        <View style={s.note}>
          <Text style={s.noteText}>
            All prices are estimates in Indian Rupees. The final price depends on your car&apos;s make, model and condition.
            Contact us for an exact quote{siteUrl ? ", or tap any item to see photos online" : ""}.
          </Text>
        </View>

        {items.length === 0 && (
          <Text style={[s.desc, { marginTop: 18 }]}>Our catalogue is being updated. Please get in touch for current products and services.</Text>
        )}
        <KindSection kind="product" items={items} categories={categories} photos={photos} siteUrl={siteUrl} />
        <KindSection kind="service" items={items} categories={categories} photos={photos} siteUrl={siteUrl} />

        {/* Closing contact block */}
        <View style={s.contact} wrap={false}>
          <Text style={s.contactKicker}>We&apos;d love to help</Text>
          <Text style={s.contactTitle}>Get in touch</Text>
          <View style={s.contactGrid}>
            {contact.address ? (
              <View style={s.contactWide}>
                <Text style={s.contactLabel}>Visit our studio</Text>
                <ContactRow icon="pin" href={directions}>
                  {[contact.businessName, ...addressLines].join("\n")}
                </ContactRow>
                <Link src={directions} style={s.link}>
                  <View style={[s.contactRow, { marginTop: 6 }]}>
                    <Icon name="directions" size={9} />
                    <Text style={[s.contactAction, { marginTop: 0, marginLeft: 5 }]}>Get directions on Google Maps</Text>
                  </View>
                </Link>
              </View>
            ) : null}
            {phones.length > 0 && (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Call</Text>
                {phones.map((p) => (
                  <ContactRow key={p} icon="phone" href={`tel:${p.replace(/[^\d+]/g, "")}`}>
                    {p}
                  </ContactRow>
                ))}
              </View>
            )}
            {mainNumber ? (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Phone</Text>
                <ContactRow icon="phone">{mainNumber}</ContactRow>
              </View>
            ) : null}
            {contact.email ? (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Email</Text>
                <ContactRow icon="mail" href={`mailto:${contact.email}`}>
                  {contact.email}
                </ContactRow>
              </View>
            ) : null}
            {igHandle ? (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Instagram</Text>
                <ContactRow icon="instagram" href={contact.instagram}>
                  {igHandle}
                </ContactRow>
              </View>
            ) : null}
            {fbHandle ? (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Facebook</Text>
                <ContactRow icon="facebook" href={contact.facebook}>
                  {fbHandle}
                </ContactRow>
              </View>
            ) : null}
            {siteUrl ? (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Website</Text>
                <ContactRow icon="globe" href={siteUrl}>
                  {site}
                </ContactRow>
              </View>
            ) : null}
            {hours.length > 0 && (
              <View style={s.contactCell}>
                <Text style={s.contactLabel}>Opening hours</Text>
                <ContactRow icon="clock">{hours.map((h) => `${h.days}: ${h.time}`).join("\n")}</ContactRow>
              </View>
            )}
          </View>
          <Text style={s.thanks}>Thank you for considering {contact.businessName}. Send us your car model and we will suggest the right options for you.</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

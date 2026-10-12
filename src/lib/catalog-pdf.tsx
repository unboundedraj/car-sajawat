import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatPrice } from "./price";
import type { CatalogItem, CatalogKind, Category, ContactContent } from "./types";

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
// Logo as raw bytes: a bare Windows path (E:...) would be treated as a URL and fetched
const LOGO = { data: readFileSync(path.join(process.cwd(), "public", "logo.png")), format: "png" as const };

// Never hyphenate words across lines
Font.registerHyphenationCallback((word) => [word]);

const C = {
  navy: "#0d1b3e",
  gold: "#b8901f",
  goldBright: "#e2bd55",
  ink: "#0b0b0c",
  muted: "#5b5b63",
  line: "#e4e4e2",
  soft: "#f4f4f2",
  red: "#d6152a",
};

const s = StyleSheet.create({
  page: { fontFamily: "Manrope", fontSize: 9.5, color: C.ink, paddingTop: 36, paddingBottom: 64, paddingHorizontal: 40, lineHeight: 1.45 },
  hero: { backgroundColor: C.navy, color: "#fff", marginHorizontal: -40, marginTop: -36, paddingHorizontal: 40, paddingTop: 34, paddingBottom: 28, marginBottom: 24 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 46, height: 46, marginRight: 12 },
  brand: { fontFamily: "Oswald", fontWeight: 700, fontSize: 20, letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 34, textTransform: "uppercase", marginTop: 18, lineHeight: 1.2 },
  heroSub: { color: C.goldBright, fontSize: 10, marginTop: 10 },
  stripe: { height: 4, backgroundColor: C.gold, marginHorizontal: -40, marginTop: -24, marginBottom: 24 },
  kindTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 22, textTransform: "uppercase", marginTop: 6, marginBottom: 10, color: C.ink },
  catRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 2 },
  catBar: { width: 3, height: 14, backgroundColor: C.red, marginRight: 7 },
  catName: { fontFamily: "Oswald", fontWeight: 500, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
  catDesc: { color: C.muted, fontSize: 9, marginLeft: 10, marginBottom: 4 },
  item: { borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 9, marginLeft: 10 },
  itemHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemName: { fontWeight: 700, fontSize: 11, flex: 1, paddingRight: 12 },
  priceBox: { alignItems: "flex-end" },
  priceLabel: { fontSize: 6.5, color: C.gold, textTransform: "uppercase", letterSpacing: 1 },
  price: { fontWeight: 700, fontSize: 11, color: C.navy },
  priceNote: { fontSize: 7.5, color: C.muted },
  tagline: { color: C.muted, marginTop: 1 },
  desc: { marginTop: 4 },
  features: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  feature: { fontSize: 8, backgroundColor: C.soft, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, marginRight: 4, marginBottom: 3 },
  note: { fontSize: 8, color: C.muted, marginTop: 4 },
  contact: { marginTop: 24, backgroundColor: C.navy, color: "#fff", borderRadius: 8, padding: 20 },
  contactTitle: { fontFamily: "Oswald", fontWeight: 700, fontSize: 18, textTransform: "uppercase", marginBottom: 16, lineHeight: 1.2 },
  contactGrid: { flexDirection: "row", flexWrap: "wrap" },
  contactCell: { width: "50%", marginBottom: 8, paddingRight: 10 },
  contactLabel: { fontSize: 7, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 },
  contactValue: { fontSize: 9.5, color: "#fff" },
  // Fixed, absolutely positioned Text elements (the pattern react-pdf documents for page footers)
  footerRule: { position: "absolute", left: 40, right: 40, bottom: 40, height: 1, backgroundColor: C.line },
  footerText: { position: "absolute", left: 40, bottom: 26, fontSize: 7.5, color: C.muted },
});

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

function Item({ item }: { item: CatalogItem }) {
  const price = formatPrice(item);
  return (
    <View style={s.item} wrap={false}>
      <View style={s.itemHead}>
        <Text style={s.itemName}>{item.name}</Text>
        <View style={s.priceBox}>
          {price ? (
            <>
              <Text style={s.priceLabel}>Est. cost</Text>
              <Price value={price} />
              {item.price_note ? <Text style={s.priceNote}>{item.price_note}</Text> : null}
            </>
          ) : (
            <Text style={s.priceNote}>Price on request</Text>
          )}
        </View>
      </View>
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
    </View>
  );
}

function KindSection({ kind, items, categories }: { kind: CatalogKind; items: CatalogItem[]; categories: Category[] }) {
  const ofKind = items.filter((i) => i.kind === kind);
  if (ofKind.length === 0) return null;
  const groups = [
    ...categories.filter((c) => c.kind === kind).map((c) => ({ name: c.name, description: c.description, items: ofKind.filter((i) => i.category_id === c.id) })),
    { name: "Other", description: null, items: ofKind.filter((i) => !i.category_id || !categories.some((c) => c.id === i.category_id)) },
  ].filter((g) => g.items.length > 0);

  return (
    <View>
      <Text style={s.kindTitle} minPresenceAhead={80}>
        {kind === "service" ? "Services" : "Products"}
      </Text>
      {groups.map((g) => (
        <View key={g.name}>
          <View wrap={false}>
            <View style={s.catRow}>
              <View style={s.catBar} />
              <Text style={s.catName}>{g.name}</Text>
            </View>
            {g.description ? <Text style={s.catDesc}>{g.description}</Text> : null}
            <Item item={g.items[0]} />
          </View>
          {g.items.slice(1).map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function renderCatalogPdf({
  items,
  categories,
  contact,
  siteUrl,
}: {
  items: CatalogItem[];
  categories: Category[];
  contact: ContactContent;
  siteUrl: string;
}) {
  const site = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const contactRows = [
    { label: "Phone", value: [contact.phone, contact.altPhone].filter(Boolean).join(" / ") },
    { label: "WhatsApp", value: contact.whatsapp ? `+${contact.whatsapp}` : "" },
    { label: "Email", value: contact.email },
    { label: "Website", value: site },
    { label: "Address", value: contact.address },
    { label: "Hours", value: contact.hours.map((h) => `${h.days}: ${h.time}`).join("\n") },
    { label: "Instagram", value: contact.instagram.replace(/^https?:\/\/(www\.)?/, "") },
    { label: "Facebook", value: contact.facebook.replace(/^https?:\/\/(www\.)?/, "") },
  ].filter((r) => r.value);

  const doc = (
    <Document title={`${contact.businessName} – Services & Products Catalogue`} author={contact.businessName} subject="Catalogue with estimated prices">
      <Page size="A4" style={s.page}>
        <View style={s.footerRule} fixed />
        <Text style={s.footerText} fixed>
          {[contact.businessName, contact.phone, contact.whatsapp ? `WhatsApp +${contact.whatsapp}` : "", site].filter(Boolean).join("  ·  ")}
        </Text>
        <View style={s.hero}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
            <Image style={s.logo} src={LOGO} />
            <Text style={s.brand}>{contact.businessName}</Text>
          </View>
          <Text style={s.heroTitle}>Services &amp; Products{"\n"}Catalogue</Text>
          <Text style={s.heroSub}>{contact.tagline}</Text>
        </View>
        <View style={s.stripe} />

        <Text style={s.note}>
          All prices are estimates in Indian Rupees. The final price depends on your car&apos;s make, model and condition. Contact us for an exact quote.
        </Text>

        {items.length === 0 && <Text style={[s.desc, { marginTop: 16 }]}>Our catalogue is being updated. Please get in touch for current services and products.</Text>}
        <KindSection kind="service" items={items} categories={categories} />
        <KindSection kind="product" items={items} categories={categories} />

        <View style={s.contact} wrap={false}>
          <Text style={s.contactTitle}>Get in touch</Text>
          <View style={s.contactGrid}>
            {contactRows.map((r) => (
              <View key={r.label} style={s.contactCell}>
                <Text style={s.contactLabel}>{r.label}</Text>
                <Text style={s.contactValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>

      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

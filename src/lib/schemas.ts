import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "Required").max(max);

/** Empty, site-relative ("/contact", "#about") or http(s) URL. Blocks javascript: etc. */
export const urlish = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^(\/|#|https?:\/\/|tel:|mailto:)/i.test(v), "Must be a link starting with / or https://");

const cta = z.object({ label: text(40), href: urlish });

export const contentSchemas = {
  hero: z.object({
    eyebrow: text(80),
    title: required(120),
    highlight: text(60),
    subtitle: text(400),
    primaryCta: cta,
    secondaryCta: cta,
    mediaType: z.enum(["none", "image", "video"]),
    mediaUrl: urlish,
    stats: z.array(z.object({ value: text(16), label: text(40) })).max(4),
  }),
  about: z.object({
    eyebrow: text(60),
    title: required(120),
    body: text(3000),
    image: urlish,
    badgeValue: text(12),
    badgeLabel: text(40),
    highlights: z.array(text(120)).max(8),
  }),
  contact: z.object({
    businessName: required(80),
    tagline: text(140),
    phone: text(30),
    altPhone: text(30),
    whatsapp: z.string().trim().regex(/^\d{0,15}$/, "Digits only, with country code (e.g. 919876543210)"),
    whatsappMessage: text(300),
    email: z.union([z.literal(""), z.email()]),
    address: text(300),
    // Accepts the bare src or the whole <iframe …> snippet copied from Google Maps
    mapEmbedUrl: z
      .string()
      .trim()
      .max(3000)
      .transform((v) => v.match(/src="([^"]+)"/)?.[1] ?? v)
      .refine((v) => v === "" || /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(v), "Paste the embed link from Google Maps → Share → Embed a map"),
    mapQuery: text(300),
    hours: z.array(z.object({ days: text(40), time: text(60) })).max(7),
    instagram: urlish,
    facebook: urlish,
    youtube: urlish,
  }),
  chatbot: z.object({
    enabled: z.boolean(),
    assistantName: required(40),
    greeting: text(300),
    suggestions: z.array(text(80)).max(4),
    knowledge: text(8000),
  }),
  payment: z.object({
    enabled: z.boolean(),
    title: required(80),
    note: text(500),
    qrImage: urlish,
    upiId: z
      .string()
      .trim()
      .max(80)
      .refine((v) => v === "" || /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v), "Enter a UPI ID like name@bank"),
    payeeName: text(80),
  }),
  testimonials: z.object({
    items: z
      .array(
        z.object({
          name: required(60),
          vehicle: text(60),
          quote: required(600),
          rating: z.number().int().min(1).max(5),
        }),
      )
      .max(20),
  }),
};

export const offerSchema = z.object({
  id: z.uuid().optional(),
  title: required(160),
  badge: text(20),
  link_url: urlish,
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

const rupees = z.number().int().min(0).max(100_000_000).nullable();

export const categorySchema = z.object({
  id: z.uuid().optional(),
  kind: z.enum(["service", "product"]),
  name: required(60),
  slug: z.string().trim().max(60).regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only"),
  description: text(400),
  sort_order: z.number().int().min(0).max(9999),
});

export const catalogSchema = z.object({
  id: z.uuid().optional(),
  kind: z.enum(["service", "product"]),
  name: required(120),
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only"),
  category_id: z.uuid("Choose a category").nullable(),
  tagline: text(200),
  description: text(5000),
  price_from: rupees,
  price_to: rupees,
  price_note: text(60),
  cover_image: urlish,
  images: z.array(urlish).max(20),
  videos: z.array(urlish).max(10),
  features: z.array(text(120)).max(12),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
}).refine((v) => v.price_to == null || v.price_from == null || v.price_to >= v.price_from, {
  message: "“To” price must be higher than “From” price",
  path: ["price_to"],
});

export const mediaSchema = z.object({
  id: z.uuid().optional(),
  kind: z.enum(["image", "video", "youtube"]),
  url: required(2000).pipe(urlish),
  title: text(140),
  category: required(60),
  is_featured: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const teamSchema = z.object({
  id: z.uuid().optional(),
  name: required(80),
  role: required(80),
  bio: text(500),
  photo_url: urlish,
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const enquirySchema = z.object({
  name: required(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  vehicle: text(80),
  interest: text(80),
  message: text(1500),
});

export type OfferInput = z.infer<typeof offerSchema>;
export type CatalogInput = z.infer<typeof catalogSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;

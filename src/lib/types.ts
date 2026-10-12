export type CtaLink = { label: string; href: string };
export type Stat = { value: string; label: string };

export type HeroContent = {
  eyebrow: string;
  title: string;
  /** Word(s) from the title rendered in the accent colour */
  highlight: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  mediaType: "none" | "image" | "video";
  mediaUrl: string;
  stats: Stat[];
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  badgeValue: string;
  badgeLabel: string;
  highlights: string[];
};

export type OpeningHours = { days: string; time: string };

export type ContactContent = {
  businessName: string;
  tagline: string;
  phone: string;
  altPhone: string;
  /** Digits only with country code, e.g. 919876543210 */
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  address: string;
  /** Google Maps "Share → Embed a map" src (or the whole <iframe> pasted in) */
  mapEmbedUrl: string;
  /** Place name/address used for the "Directions" link (and as the map if no embed URL) */
  mapQuery: string;
  hours: OpeningHours[];
  instagram: string;
  facebook: string;
  youtube: string;
};

export type ChatbotContent = {
  enabled: boolean;
  assistantName: string;
  greeting: string;
  suggestions: string[];
  /** Extra facts, FAQs and policies fed to the model as context */
  knowledge: string;
};

export type Testimonial = { name: string; vehicle: string; quote: string; rating: number };
export type TestimonialsContent = { items: Testimonial[] };

export type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  chatbot: ChatbotContent;
  testimonials: TestimonialsContent;
};

export type SiteContentKey = keyof SiteContent;

export type Offer = {
  id: string;
  title: string;
  badge: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type CatalogKind = "service" | "product";

export type Category = {
  id: string;
  kind: CatalogKind;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  name: string;
  slug: string;
  category_id: string | null;
  /** Resolved category name (joined from categories), "Other" when unset */
  category: string;
  tagline: string | null;
  description: string | null;
  /** Estimated cost in whole rupees */
  price_from: number | null;
  price_to: number | null;
  /** e.g. "onwards", "per seat", "incl. installation" */
  price_note: string | null;
  cover_image: string | null;
  images: string[];
  videos: string[];
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type MediaKind = "image" | "video" | "youtube";

export type MediaAsset = {
  id: string;
  kind: MediaKind;
  url: string;
  title: string | null;
  category: string;
  is_featured: boolean;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle: string | null;
  interest: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
};

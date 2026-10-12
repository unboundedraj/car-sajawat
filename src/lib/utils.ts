import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** CSS-columns masonry classes sized to the item count, centred when there are only a few. */
export function masonryClass(count: number) {
  if (count <= 1) return "mx-auto max-w-sm columns-1";
  if (count === 2) return "mx-auto max-w-2xl columns-2 gap-3 sm:gap-4";
  if (count === 3) return "mx-auto max-w-4xl columns-2 gap-3 sm:columns-3 sm:gap-4";
  return "columns-2 gap-3 md:columns-3 lg:columns-4 sm:gap-4";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Pre-filled WhatsApp enquiry. WhatsApp can't pre-fill typed answers, so the visitor gets a short
 * form (name, car model, year, requirement) to complete before sending.
 */
export function enquiryMessage(businessName: string, interest?: string) {
  const intro = interest ? `I'm interested in *${interest}*.` : "I'd like to make an enquiry.";
  return `Hi ${businessName}! 👋\n${intro}\n\nMy details:\n*Name:* \n*Car model:* \n*Year:* \n*Requirement:* `;
}

/** The message sent from the website popup, with the visitor's answers filled in. */
export function whatsappMessageFrom(
  businessName: string,
  d: { name: string; car: string; year: string; requirement: string },
  interest?: string,
) {
  const intro = interest ? `I'm interested in *${interest}*.` : "I'd like to make an enquiry.";
  return [
    `Hi ${businessName}! 👋`,
    intro,
    "",
    `*Name:* ${d.name}`,
    `*Car model:* ${d.car}`,
    ...(d.year ? [`*Year:* ${d.year}`] : []),
    `*Requirement:* ${d.requirement}`,
  ].join("\n");
}

/** "919324067900" → "+91 93240 67900" (other numbers are shown as +digits) */
export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 12 && d.startsWith("91")) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mapEmbedUrl(query: string) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const q = encodeURIComponent(query);
  return key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}`
    : `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

export function mapDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/** Split a title around its highlighted phrase so it can be coloured. */
export function splitHighlight(title: string, highlight: string) {
  const idx = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (idx === -1) return { before: title, match: "", after: "" };
  return {
    before: title.slice(0, idx),
    match: title.slice(idx, idx + highlight.length),
    after: title.slice(idx + highlight.length),
  };
}

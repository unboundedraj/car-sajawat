import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

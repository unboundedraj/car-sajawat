import type { CatalogItem } from "./types";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** "₹4,999" or "₹4,999 – ₹9,999". Null when no estimate is set. */
export function formatPrice(item: Pick<CatalogItem, "price_from" | "price_to">, symbol = "₹"): string | null {
  const { price_from: from, price_to: to } = item;
  if (from == null && to == null) return null;
  if (from != null && to != null && to > from) return `${symbol}${inr.format(from)} – ${symbol}${inr.format(to)}`;
  return `${symbol}${inr.format((from ?? to)!)}`;
}

export const PRICE_DISCLAIMER = "Final price depends on your car's make, model and condition.";

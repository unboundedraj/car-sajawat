import Link from "next/link";
import { createElement, type ComponentProps } from "react";
import { Armchair, ArrowUpRight, Cpu, Lightbulb, Palette, Shield, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/price";
import type { CatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/protect|ppf|coat|film/i, Shield],
  [/styl|wrap|paint|body/i, Palette],
  [/interior|seat|mat/i, Armchair],
  [/light|lamp|led/i, Lightbulb],
  [/electr|audio|music|infotain|camera/i, Cpu],
  [/care|detail|clean|wash/i, Sparkles],
];

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS.find(([re]) => re.test(category))?.[1] ?? Wrench;
}

/** Renders the icon for a category (createElement keeps the lookup out of render-time component creation). */
export function CategoryIcon({ category, ...props }: { category: string } & ComponentProps<LucideIcon>) {
  return createElement(categoryIcon(category), props);
}

export function CatalogVisual({ item, className, sizes }: { item: CatalogItem; className?: string; sizes?: string }) {
  const src = item.cover_image || item.images[0];
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {src ? (
        <SmartImage
          src={src}
          alt={item.name}
          fill
          sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0">
          <div className="stripe-bg absolute inset-0" />
          <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-accent/20 blur-3xl transition-all duration-700 group-hover:bg-accent/35" />
          <CategoryIcon
            category={item.category}
            strokeWidth={1}
            className="absolute right-6 bottom-6 size-24 text-accent/70 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    </div>
  );
}

/** "Est. ₹4,999 onwards" or "Price on request" */
export function PriceTag({ item }: { item: CatalogItem }) {
  const price = formatPrice(item);
  if (!price) return <span className="text-sm font-medium text-muted">Price on request</span>;
  return (
    <span className="leading-tight">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted">Est. cost</span>
      <span className="font-display text-xl font-semibold text-gold">{price}</span>
      {item.price_note && <span className="ml-1.5 text-xs text-muted">{item.price_note}</span>}
    </span>
  );
}

export function CatalogCard({ item, index }: { item: CatalogItem; index?: number }) {
  return (
    <Link
      href={`/services/${item.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_30px_60px_-30px_var(--glow)]"
    >
      <CatalogVisual item={item} className="aspect-[4/3]" />
      <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur">
        {item.category}
      </span>
      {typeof index === "number" && (
        <span className="absolute top-3 right-4 font-display text-4xl font-bold text-white/80 drop-shadow">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="display text-2xl font-semibold">{item.name}</h3>
        {item.tagline && <p className="mt-2 line-clamp-2 text-sm text-muted">{item.tagline}</p>}
        <div className="mt-auto flex items-center justify-between pt-6">
          <PriceTag item={item} />
          <span className="grid size-10 place-items-center rounded-full border border-line transition-all duration-300 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CatalogItem, CatalogKind, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CatalogCard } from "./catalog-card";

const TABS: { value: CatalogKind; label: string }[] = [
  { value: "product", label: "Products" },
  { value: "service", label: "Services" },
];

export function CatalogBrowser({ items, categories: allCategories }: { items: CatalogItem[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const tab: CatalogKind = params.get("tab") === "service" ? "service" : "product";
  const [category, setCategory] = useState("All");

  const ofKind = useMemo(() => items.filter((i) => i.kind === tab), [items, tab]);
  // Admin-ordered categories that actually have items, plus "Other" for uncategorised ones
  const categories = useMemo(() => {
    const used = allCategories.filter((c) => c.kind === tab && ofKind.some((i) => i.category_id === c.id)).map((c) => c.name);
    return ["All", ...used, ...(ofKind.some((i) => !i.category_id) ? ["Other"] : [])];
  }, [allCategories, ofKind, tab]);
  const activeCategory = categories.includes(category) ? category : "All";
  const visible = activeCategory === "All" ? ofKind : ofKind.filter((i) => i.category === activeCategory);
  const description = allCategories.find((c) => c.kind === tab && c.name === activeCategory)?.description;

  function selectTab(value: CatalogKind) {
    setCategory("All");
    router.replace(value === "product" ? "/services" : "/services?tab=service", { scroll: false });
  }

  return (
    <div>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Catalogue type" className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={tab === t.value}
              onClick={() => selectTab(t.value)}
              className={cn(
                "relative whitespace-nowrap rounded-full px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors sm:px-6",
                tab === t.value ? "text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab === t.value && (
                <motion.span layoutId="catalog-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", duration: 0.5 }} />
              )}
              <span className="relative">
                {t.label} <span className="opacity-60">({items.filter((i) => i.kind === t.value).length})</span>
              </span>
            </button>
          ))}
        </div>

        {categories.length > 2 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={activeCategory === c}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === c ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {description && <p className="mt-6 max-w-3xl text-muted">{description}</p>}

      {visible.length === 0 ? (
        <p className="card mt-10 p-10 text-center text-muted">Nothing listed here yet. Check back soon!</p>
      ) : (
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <CatalogCard item={item} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

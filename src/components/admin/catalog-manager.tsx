"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FolderPlus, Loader2, Pencil, Plus, Search, Star, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCatalogItem, deleteCategory, saveCatalogItem, saveCategory } from "@/app/admin/actions";
import { CategoryIcon } from "@/components/catalog/catalog-card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/price";
import type { CatalogInput, CategoryInput } from "@/lib/schemas";
import type { CatalogItem, CatalogKind, Category } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { Drawer, Field, IconButton, MediaField, MediaList, NumberInput, StringList, TextArea, TextInput, Toggle, inputClass } from "./fields";
import { confirmDelete, useAdminAction } from "./use-action";

const emptyItem = (kind: CatalogKind, sort: number, category_id: string | null): CatalogInput => ({
  kind,
  name: "",
  slug: "",
  category_id,
  tagline: "",
  description: "",
  price_from: null,
  price_to: null,
  price_note: "",
  cover_image: "",
  images: [],
  videos: [],
  features: [],
  is_featured: false,
  is_active: true,
  sort_order: sort,
});

const toInput = (i: CatalogItem): CatalogInput => ({
  id: i.id,
  kind: i.kind,
  name: i.name,
  slug: i.slug,
  category_id: i.category_id,
  tagline: i.tagline ?? "",
  description: i.description ?? "",
  price_from: i.price_from,
  price_to: i.price_to,
  price_note: i.price_note ?? "",
  cover_image: i.cover_image ?? "",
  images: i.images,
  videos: i.videos,
  features: i.features,
  is_featured: i.is_featured,
  is_active: i.is_active,
  sort_order: i.sort_order,
});

const label = (kind: CatalogKind, plural = false) => (kind === "service" ? "service" : "product") + (plural ? "s" : "");

/** Rupee input: empty means "not set" (null) */
function RupeeInput({ label: text, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <Field label={text}>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted">₹</span>
        <input
          aria-label={text}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value))))}
          className={cn(inputClass, "pl-8")}
          placeholder="—"
        />
      </div>
    </Field>
  );
}

export function CatalogManager({ items, categories }: { items: CatalogItem[]; categories: Category[] }) {
  const [kind, setKind] = useState<CatalogKind>("service");
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [editing, setEditing] = useState<CatalogInput | null>(null);
  const [editingCat, setEditingCat] = useState<CategoryInput | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const { pending, run } = useAdminAction();

  const kindCats = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);
  const countIn = (catId: string | null) => items.filter((i) => i.kind === kind && i.category_id === catId).length;
  const list = items.filter(
    (i) =>
      i.kind === kind &&
      (filterCat === "all" || (filterCat === "none" ? !i.category_id : i.category_id === filterCat)) &&
      (!query || `${i.name} ${i.category}`.toLowerCase().includes(query.toLowerCase())),
  );
  const uncategorised = countIn(null);

  function openItem(input: CatalogInput) {
    setSlugTouched(!!input.id);
    setNewCatName("");
    setEditing(input);
  }
  const set = (patch: Partial<CatalogInput>) => setEditing((e) => (e ? { ...e, ...patch } : e));

  async function quickAddCategory() {
    if (!editing || !newCatName.trim()) return;
    const res = await saveCategory({
      kind: editing.kind,
      name: newCatName.trim(),
      slug: slugify(newCatName),
      description: "",
      sort_order: categories.filter((c) => c.kind === editing.kind).length,
    });
    if (!res.ok) return toast.error(res.error);
    set({ category_id: res.data!.id });
    setNewCatName("");
    toast.success("Category created");
  }

  const editingKindCats = categories.filter((c) => c.kind === editing?.kind);
  const defaultCat = filterCat !== "all" && filterCat !== "none" ? filterCat : (kindCats[0]?.id ?? null);

  return (
    <div className="space-y-8">
      {/* Kind switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
          {(["service", "product"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k);
                setFilterCat("all");
              }}
              className={cn("rounded-full px-5 py-2 text-sm font-medium capitalize", kind === k ? "bg-accent text-accent-fg" : "text-muted hover:text-fg")}
            >
              {label(k, true)} ({items.filter((i) => i.kind === k).length})
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => openItem(emptyItem(kind, items.filter((i) => i.kind === kind).length, defaultCat))}>
          <Plus className="size-4" /> New {label(kind)}
        </Button>
      </div>

      {/* Categories */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide">
            <Tags className="size-4 text-accent" /> {label(kind)} categories
          </h2>
          <Button size="sm" variant="outline" onClick={() => setEditingCat({ kind, name: "", slug: "", description: "", sort_order: kindCats.length })}>
            <FolderPlus className="size-4" /> New category
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterCat("all")}
            className={cn("rounded-full border px-4 py-2 text-sm", filterCat === "all" ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:text-fg")}
          >
            All ({items.filter((i) => i.kind === kind).length})
          </button>
          {kindCats.map((c) => (
            <div
              key={c.id}
              className={cn("flex items-center rounded-full border text-sm", filterCat === c.id ? "border-accent bg-accent/10 text-accent" : "border-line text-muted")}
            >
              <button type="button" onClick={() => setFilterCat(c.id)} className="flex items-center gap-1.5 py-2 pr-1 pl-4 hover:text-fg">
                <CategoryIcon category={c.name} className="size-3.5" /> {c.name} ({countIn(c.id)})
              </button>
              <button
                type="button"
                aria-label={`Edit ${c.name}`}
                onClick={() => setEditingCat({ ...c, description: c.description ?? "" })}
                className="grid size-8 place-items-center rounded-full hover:text-fg"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          ))}
          {uncategorised > 0 && (
            <button
              type="button"
              onClick={() => setFilterCat("none")}
              className={cn("rounded-full border border-dashed px-4 py-2 text-sm", filterCat === "none" ? "border-accent text-accent" : "border-amber/60 text-amber")}
            >
              No category ({uncategorised})
            </button>
          )}
          {kindCats.length === 0 && <p className="py-2 text-sm text-muted">No categories yet. Create one to group your {label(kind, true)}.</p>}
        </div>
      </section>

      {/* Items */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label(kind, true)}…`} className={cn(inputClass, "pl-9")} aria-label="Search" />
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((item) => {
            const img = item.cover_image || item.images[0];
            const price = formatPrice(item);
            return (
              <li key={item.id} className={cn("card flex items-center gap-4 p-3", !item.is_active && "opacity-60")}>
                <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2 text-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" className="absolute inset-0 size-full object-cover" /> : <CategoryIcon category={item.category} className="size-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {item.is_featured && <Star className="size-3.5 shrink-0 fill-amber text-amber" aria-label="Featured" />}
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {item.category_id ? item.category : <span className="text-amber">No category</span>} ·{" "}
                    {price ? <span className="text-fg">{price}</span> : <span className="text-amber">no price</span>} {!item.is_active && "· hidden"}
                  </p>
                </div>
                <a href={`/services/${item.slug}`} target="_blank" className="hidden size-10 place-items-center rounded-xl text-muted hover:text-fg sm:grid" aria-label="View on site">
                  <ExternalLink className="size-4" />
                </a>
                <IconButton label="Edit" onClick={() => openItem(toInput(item))}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label="Delete"
                  tone="danger"
                  disabled={pending}
                  onClick={() => confirmDelete(`"${item.name}" and its uploaded media`) && run(() => deleteCatalogItem(item.id), "Deleted")}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            );
          })}
          {list.length === 0 && <li className="card p-10 text-center text-sm text-muted md:col-span-2">Nothing here yet.</li>}
        </ul>
      </div>

      {/* Category drawer */}
      <Drawer
        open={!!editingCat}
        title={editingCat?.id ? "Edit category" : `New ${editingCat ? label(editingCat.kind) : ""} category`}
        onClose={() => setEditingCat(null)}
        footer={
          <>
            {editingCat?.id && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-auto text-accent"
                disabled={pending}
                onClick={() => {
                  const n = items.filter((i) => i.category_id === editingCat.id).length;
                  const note = n ? ` (its ${n} item${n > 1 ? "s" : ""} will be kept under "No category")` : "";
                  if (confirmDelete(`the "${editingCat.name}" category${note}`)) {
                    run(() => deleteCategory(editingCat.id!), "Category deleted", () => {
                      setEditingCat(null);
                      setFilterCat("all");
                    });
                  }
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditingCat(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={() => editingCat && run(() => saveCategory(editingCat), "Category saved", () => setEditingCat(null))}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </>
        }
      >
        {editingCat && (
          <>
            <TextInput
              label="Name"
              value={editingCat.name}
              onChange={(v) => setEditingCat({ ...editingCat, name: v, ...(editingCat.id ? {} : { slug: slugify(v) }) })}
              placeholder={editingCat.kind === "service" ? "Protection" : "Interior accessories"}
            />
            <TextArea
              label="Description (optional)"
              rows={3}
              value={editingCat.description}
              onChange={(v) => setEditingCat({ ...editingCat, description: v })}
              hint="Shown when visitors filter by this category, and in the PDF catalogue."
            />
            <NumberInput label="Display order" value={editingCat.sort_order} onChange={(v) => setEditingCat({ ...editingCat, sort_order: v })} />
          </>
        )}
      </Drawer>

      {/* Item drawer */}
      <Drawer
        open={!!editing}
        title={editing?.id ? `Edit ${label(editing.kind)}` : `New ${editing ? label(editing.kind) : ""}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={() => editing && run(() => saveCatalogItem(editing), "Saved and published", () => setEditing(null))}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </>
        }
      >
        {editing && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select aria-label="Type" value={editing.kind} onChange={(e) => set({ kind: e.target.value as CatalogKind, category_id: null })} className={inputClass}>
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                </select>
              </Field>
              <Field label="Category">
                <select aria-label="Category" value={editing.category_id ?? ""} onChange={(e) => set({ category_id: e.target.value || null })} className={inputClass}>
                  <option value="">— No category —</option>
                  {editingKindCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    quickAddCategory();
                  }
                }}
                placeholder={`…or create a new ${label(editing.kind)} category`}
                className={inputClass}
                aria-label="New category name"
              />
              <Button size="sm" variant="outline" className="h-auto shrink-0" disabled={!newCatName.trim()} onClick={quickAddCategory}>
                <FolderPlus className="size-4" /> Add
              </Button>
            </div>

            <TextInput label="Name" value={editing.name} onChange={(v) => set({ name: v, ...(slugTouched ? {} : { slug: slugify(v) }) })} />
            <TextInput
              label="URL slug"
              hint={`/services/${editing.slug || "…"}`}
              value={editing.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set({ slug: slugify(v) });
              }}
            />
            <TextInput label="Tagline" value={editing.tagline} onChange={(v) => set({ tagline: v })} placeholder="One line shown on cards" />

            <div className="rounded-xl border border-line p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Estimated cost</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <RupeeInput label="From" value={editing.price_from} onChange={(v) => set({ price_from: v })} />
                <RupeeInput label="To (optional)" value={editing.price_to} onChange={(v) => set({ price_to: v })} />
                <TextInput label="Note" value={editing.price_note} onChange={(v) => set({ price_note: v })} placeholder="onwards / per seat" />
              </div>
              <p className="mt-2 text-xs text-muted">
                Shows as <strong className="text-fg">{formatPrice(editing) ?? "Price on request"}</strong>
                {editing.price_note && formatPrice(editing) ? ` ${editing.price_note}` : ""}. Leave both empty to show “Price on request”.
              </p>
            </div>

            <TextArea label="Description" rows={6} value={editing.description} onChange={(v) => set({ description: v })} />
            <StringList label="Key features" values={editing.features} onChange={(v) => set({ features: v })} placeholder="e.g. 5-year warranty" />
            <MediaField label="Cover image" folder="catalog" value={editing.cover_image} onChange={(v) => set({ cover_image: v })} hint="Used on cards. Landscape 4:3 works best." />
            <MediaList label="Photo gallery" folder="catalog" values={editing.images} onChange={(v) => set({ images: v })} />
            <MediaList label="Videos" accept="video" folder="catalog" values={editing.videos} onChange={(v) => set({ videos: v })} hint="Upload MP4 (max 50 MB) or paste a YouTube link." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Featured" hint="Show on the home page" checked={editing.is_featured} onChange={(v) => set({ is_featured: v })} />
              <Toggle label="Visible" hint="Hide without deleting" checked={editing.is_active} onChange={(v) => set({ is_active: v })} />
            </div>
            <NumberInput label="Display order" value={editing.sort_order} onChange={(v) => set({ sort_order: v })} />
          </>
        )}
      </Drawer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteOffer, saveOffer } from "@/app/admin/actions";
import { OfferStrip } from "@/components/site/offer-strip";
import { Button } from "@/components/ui/button";
import type { OfferInput } from "@/lib/schemas";
import type { Offer } from "@/lib/types";
import { Drawer, IconButton, NumberInput, TextInput, Toggle } from "./fields";
import { confirmDelete, useAdminAction } from "./use-action";

const empty = (sort: number): OfferInput => ({ title: "", badge: "", link_url: "/contact", is_active: true, sort_order: sort });

export function OffersManager({ offers }: { offers: Offer[] }) {
  const [editing, setEditing] = useState<OfferInput | null>(null);
  const { pending, run } = useAdminAction();
  const active = offers.filter((o) => o.is_active);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Live preview</p>
        <div className="overflow-hidden rounded-2xl border border-line py-4">
          {active.length ? <OfferStrip offers={active} /> : <p className="py-2 text-center text-sm text-muted">No active offers, so the strip is hidden on the site.</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setEditing(empty(offers.length))} size="sm">
          <Plus className="size-4" /> New offer
        </Button>
      </div>

      <ul className="space-y-3">
        {offers.map((o) => (
          <li key={o.id} className="card flex items-center gap-3 p-4">
            <span className={`size-2 shrink-0 rounded-full ${o.is_active ? "bg-emerald-500" : "bg-line-strong"}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {o.badge && <span className="mr-2 rounded bg-accent/15 px-1.5 py-0.5 text-xs font-bold text-accent uppercase">{o.badge}</span>}
                {o.title}
              </p>
              <p className="truncate text-xs text-muted">
                #{o.sort_order} · {o.link_url || "no link"}
              </p>
            </div>
            <IconButton
              label={o.is_active ? "Hide" : "Show"}
              disabled={pending}
              onClick={() =>
                run(() => saveOffer({ ...o, badge: o.badge ?? "", link_url: o.link_url ?? "", is_active: !o.is_active }), o.is_active ? "Offer hidden" : "Offer live")
              }
            >
              {o.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </IconButton>
            <IconButton label="Edit" onClick={() => setEditing({ ...o, badge: o.badge ?? "", link_url: o.link_url ?? "" })}>
              <Pencil className="size-4" />
            </IconButton>
            <IconButton label="Delete" tone="danger" disabled={pending} onClick={() => confirmDelete("this offer") && run(() => deleteOffer(o.id), "Offer deleted")}>
              <Trash2 className="size-4" />
            </IconButton>
          </li>
        ))}
        {offers.length === 0 && <li className="card p-10 text-center text-sm text-muted">No offers yet.</li>}
      </ul>

      <Drawer
        open={!!editing}
        title={editing?.id ? "Edit offer" : "New offer"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={() => editing && run(() => saveOffer(editing), "Offer saved", () => setEditing(null))}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </>
        }
      >
        {editing && (
          <>
            <TextInput label="Offer text" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Flat 15% off on full-body PPF this month" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Badge" hint="Short tag, e.g. NEW, 15% OFF" value={editing.badge} onChange={(v) => setEditing({ ...editing, badge: v })} />
              <TextInput label="Link" hint="/contact, /services/… or https://" value={editing.link_url} onChange={(v) => setEditing({ ...editing, link_url: v })} />
            </div>
            <NumberInput label="Order" value={editing.sort_order} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
            <Toggle label="Active" hint="Only active offers appear in the strip" checked={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </>
        )}
      </Drawer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Car, Mail, Phone, Trash2 } from "lucide-react";
import { deleteEnquiry, setEnquiryStatus } from "@/app/admin/actions";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import type { Enquiry, EnquiryStatus } from "@/lib/types";
import { cn, telLink, whatsappLink } from "@/lib/utils";
import { IconButton } from "./fields";
import { confirmDelete, useAdminAction } from "./use-action";

const STATUS: { value: EnquiryStatus; label: string; className: string }[] = [
  { value: "new", label: "New", className: "bg-accent/15 text-accent" },
  { value: "contacted", label: "Contacted", className: "bg-amber/15 text-amber" },
  { value: "closed", label: "Closed", className: "bg-emerald-500/15 text-emerald-500" },
];

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export function EnquiriesManager({ enquiries }: { enquiries: Enquiry[] }) {
  const [filter, setFilter] = useState<EnquiryStatus | "all">("all");
  const { pending, run } = useAdminAction();
  const list = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[{ value: "all" as const, label: "All" }, ...STATUS].map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              filter === s.value ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg",
            )}
          >
            {s.label} ({s.value === "all" ? enquiries.length : enquiries.filter((e) => e.status === s.value).length})
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {list.map((e) => {
          const digits = e.phone.replace(/\D/g, "");
          const wa = digits.length === 10 ? `91${digits}` : digits;
          return (
            <li key={e.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{e.name}</p>
                  <p className="text-xs text-muted">{dateFmt.format(new Date(e.created_at))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Status"
                    value={e.status}
                    disabled={pending}
                    onChange={(ev) => run(() => setEnquiryStatus(e.id, ev.target.value as EnquiryStatus), "Status updated")}
                    className={cn("rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none", STATUS.find((s) => s.value === e.status)?.className)}
                  >
                    {STATUS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-bg text-fg">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <IconButton label="Delete" tone="danger" disabled={pending} onClick={() => confirmDelete("this enquiry") && run(() => deleteEnquiry(e.id), "Deleted")}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a href={telLink(e.phone)} className="flex items-center gap-1.5 hover:text-accent">
                  <Phone className="size-4 text-muted" /> {e.phone}
                </a>
                <a href={whatsappLink(wa, `Hi ${e.name}, this is Car Sajawat regarding your enquiry.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#25D366]">
                  <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
                </a>
                {e.email && (
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-accent">
                    <Mail className="size-4 text-muted" /> {e.email}
                  </a>
                )}
                {e.vehicle && (
                  <span className="flex items-center gap-1.5">
                    <Car className="size-4 text-muted" /> {e.vehicle}
                  </span>
                )}
              </div>
              {e.interest && (
                <p className="mt-3 text-sm">
                  <span className="text-muted">Interested in:</span> {e.interest}
                </p>
              )}
              {e.message && <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm whitespace-pre-line">{e.message}</p>}
            </li>
          );
        })}
        {list.length === 0 && <li className="card p-10 text-center text-sm text-muted">No enquiries here.</li>}
      </ul>
    </div>
  );
}

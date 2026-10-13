"use client";

import { Phone } from "lucide-react";
import { CopyIcon, useCopy } from "@/components/ui/copy-text";

/** Contact-page card showing the main number; clicking anywhere on it copies the number. */
export function PhoneCopyCard({ number, hint, className }: { number: string; hint: string; className: string }) {
  const { copied, copy } = useCopy(number);
  return (
    <button type="button" onClick={copy} aria-label={copied ? "Phone number copied" : `Copy phone number ${number}`} className={`${className} w-full text-left`}>
      <span className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
          <Phone className="size-5" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors group-hover:border-accent/60 group-hover:text-fg">
          <CopyIcon copied={copied} className="size-3.5" />
          {copied ? "Copied" : "Copy"}
        </span>
      </span>
      <span className="mt-5 block text-xs font-semibold uppercase tracking-widest text-muted">Phone</span>
      <span className="mt-1 block font-semibold break-words">{number}</span>
      <span className="mt-auto block pt-3 text-xs text-muted">{hint}</span>
    </button>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Copies `value` to the clipboard on click and briefly shows a tick. */
export function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. non-secure context); the value stays visible to copy by hand
    }
  }
  return { copied, copy };
}

export function CopyIcon({ copied, className }: { copied: boolean; className?: string }) {
  return copied ? <Check className={cn("size-4 text-emerald-500", className)} /> : <Copy className={cn("size-4", className)} />;
}

/** Inline text with a copy icon; the whole thing is one button. */
export function CopyText({ value, label, className, children }: { value: string; label: string; className?: string; children?: ReactNode }) {
  const { copied, copy } = useCopy(value);
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied!" : "Click to copy"}
      className={cn("group/copy inline-flex items-center gap-1.5 text-left transition-colors hover:text-accent", className)}
    >
      {children ?? value}
      <CopyIcon copied={copied} className="size-3.5 shrink-0 opacity-70 group-hover/copy:opacity-100" />
    </button>
  );
}

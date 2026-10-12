"use client";

import { useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Link2, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { isVideoUrl, youtubeThumb } from "@/lib/media";
import { cn } from "@/lib/utils";
import { uploadFile } from "./upload";

export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-accent";

export function Field({
  label,
  hint,
  action,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  /** Optional control shown on the right of the label (e.g. "Write with AI") */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <span className="mb-1.5 flex min-h-6 items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
        {action}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  className,
  ...props
}: { label: string; hint?: ReactNode; value: string; onChange: (v: string) => void } & Omit<ComponentProps<"input">, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  action,
  value,
  onChange,
  rows = 4,
  className,
  ...props
}: { label: string; hint?: ReactNode; action?: ReactNode; value: string; onChange: (v: string) => void } & Omit<ComponentProps<"textarea">, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint} action={action} className={className}>
      <textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={cn(inputClass, "resize-y")} {...props} />
    </Field>
  );
}

export function NumberInput({ label, value, onChange, className }: { label: string; value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <Field label={label} className={className}>
      <input aria-label={label} type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={inputClass} />
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-line-strong")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </button>
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Editable list of short strings (features, highlights, suggestions…) */
export function StringList({
  label,
  values,
  onChange,
  placeholder,
  max = 12,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <GripVertical className="mt-3 size-4 shrink-0 text-muted/50" />
            <input
              aria-label={`${label} ${i + 1}`}
              value={v}
              placeholder={placeholder}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputClass}
            />
            <IconButton label="Remove" onClick={() => onChange(values.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
        {values.length < max && (
          <button type="button" onClick={() => onChange([...values, ""])} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            <Plus className="size-4" /> Add
          </button>
        )}
      </div>
    </Field>
  );
}

export function IconButton({ label, onClick, children, tone = "default", disabled }: { label: string; onClick: () => void; children: ReactNode; tone?: "default" | "danger"; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors disabled:opacity-40",
        tone === "danger" ? "hover:border-accent hover:bg-accent/10 hover:text-accent" : "hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function Preview({ url, className }: { url: string; className?: string }) {
  const thumb = youtubeThumb(url);
  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumb} alt="" className={cn("object-cover", className)} />;
  }
  if (isVideoUrl(url)) return <video src={`${url}#t=0.5`} muted preload="metadata" className={cn("object-cover", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={cn("object-cover", className)} />;
}

/**
 * Upload one or more files, or paste a URL. accept="image" | "video" | "both".
 * Calls onAdd with the resulting public URLs.
 */
export function Uploader({
  accept = "image",
  folder,
  multiple = false,
  onAdd,
  allowUrl = true,
  compact = false,
}: {
  accept?: "image" | "video" | "both";
  folder: string;
  multiple?: boolean;
  onAdd: (urls: string[]) => void;
  allowUrl?: boolean;
  compact?: boolean;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const mime = accept === "image" ? "image/*" : accept === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*,video/mp4,video/webm,video/quicktime";

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const urls: string[] = [];
    for (const [i, file] of Array.from(files).entries()) {
      setBusy(`Uploading ${i + 1}/${files.length}…`);
      try {
        urls.push(await uploadFile(file, folder));
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    if (urls.length) {
      onAdd(urls);
      toast.success(urls.length === 1 ? "Uploaded" : `${urls.length} files uploaded`);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", !compact && "sm:flex-row")}>
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent",
          busy && "pointer-events-none opacity-60",
        )}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {busy ?? `Upload ${accept === "both" ? "file" : accept}${multiple ? "s" : ""}`}
      </label>
      <input id={inputId} ref={fileRef} type="file" accept={mime} multiple={multiple} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      {allowUrl && (
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const v = url.trim();
            if (!/^https?:\/\//.test(v)) return toast.error("Paste a full https:// link");
            onAdd([v]);
            setUrl("");
          }}
        >
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={accept === "image" ? "…or paste an image URL" : "…or paste a YouTube / video URL"}
              className={cn(inputClass, "pl-9")}
              aria-label="Media URL"
            />
          </div>
          <button type="submit" className="rounded-xl border border-line px-3 text-sm font-medium hover:border-accent hover:text-accent">
            Add
          </button>
        </form>
      )}
    </div>
  );
}

/** Single image/video field with preview + replace/remove */
export function MediaField({
  label,
  value,
  onChange,
  folder,
  accept = "image",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder: string;
  accept?: "image" | "video" | "both";
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-bg p-2">
          <Preview url={value} className="h-16 w-24 shrink-0 rounded-lg bg-surface-2" />
          <p className="min-w-0 flex-1 truncate text-xs text-muted" title={value}>
            {value}
          </p>
          <IconButton label="Remove" tone="danger" onClick={() => onChange("")}>
            <X className="size-4" />
          </IconButton>
        </div>
      ) : (
        <Uploader accept={accept} folder={folder} onAdd={(urls) => onChange(urls[0])} />
      )}
    </Field>
  );
}

/** Ordered list of media URLs with thumbnails */
export function MediaList({
  label,
  values,
  onChange,
  folder,
  accept = "image",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  folder: string;
  accept?: "image" | "video" | "both";
  hint?: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <Field label={label} hint={hint}>
      {values.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {values.map((v, i) => (
            <div key={`${v}-${i}`} className="group relative aspect-video overflow-hidden rounded-lg border border-line bg-surface-2">
              <Preview url={v} className="absolute inset-0 size-full" />
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <div className="flex gap-1">
                  <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="rounded bg-white/20 px-1.5 text-xs text-white">
                    ←
                  </button>
                  <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="rounded bg-white/20 px-1.5 text-xs text-white">
                    →
                  </button>
                </div>
                <button type="button" aria-label="Remove" onClick={() => onChange(values.filter((_, j) => j !== i))} className="rounded bg-accent p-1 text-white">
                  <Trash2 className="size-3" />
                </button>
              </div>
              {i === 0 && accept === "image" && <span className="absolute top-1 left-1 rounded bg-accent px-1.5 text-[10px] font-bold text-white">MAIN</span>}
            </div>
          ))}
        </div>
      )}
      <Uploader accept={accept} folder={folder} multiple onAdd={(urls) => onChange([...values, ...urls])} />
    </Field>
  );
}

/** Slide-over panel used for create/edit forms */
export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-line bg-bg-elevated shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 className="display text-2xl font-bold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>
      </div>
    </div>,
    document.body,
  );
}

export function AdminCard({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Pencil, Play, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, saveMedia } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { isVideoUrl, youtubeId, youtubeThumb } from "@/lib/media";
import type { MediaInput } from "@/lib/schemas";
import type { MediaAsset, MediaKind } from "@/lib/types";
import { AdminCard, Drawer, IconButton, NumberInput, TextInput, Toggle, Uploader } from "./fields";
import { confirmDelete, useAdminAction } from "./use-action";

function detectKind(url: string): MediaKind {
  if (youtubeId(url)) return "youtube";
  return isVideoUrl(url) ? "video" : "image";
}

export function GalleryManager({ media }: { media: MediaAsset[] }) {
  const [category, setCategory] = useState("General");
  const [editing, setEditing] = useState<MediaInput | null>(null);
  const [adding, setAdding] = useState(false);
  const { pending, run } = useAdminAction();
  const categories = [...new Set(["General", ...media.map((m) => m.category)])];

  async function addMany(urls: string[]) {
    setAdding(true);
    let ok = 0;
    for (const url of urls) {
      const res = await saveMedia({ kind: detectKind(url), url, title: "", category: category || "General", is_featured: false, sort_order: 0 });
      if (res.ok) ok++;
      else toast.error(res.error);
    }
    setAdding(false);
    if (ok) toast.success(`${ok} item${ok > 1 ? "s" : ""} added to the gallery`);
  }

  return (
    <div className="space-y-8">
      <AdminCard title="Add media" description="Upload photos or MP4 videos (max 50 MB each), or paste a YouTube link. Long videos are best on YouTube.">
        <div className="max-w-xs">
          <TextInput label="Category for new items" value={category} onChange={setCategory} list="gallery-cats" />
          <datalist id="gallery-cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <Uploader accept="both" folder="gallery" multiple onAdd={addMany} />
        {adding && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" /> Saving…
          </p>
        )}
      </AdminCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {media.map((m) => {
          const thumb = m.kind === "youtube" ? youtubeThumb(m.url) : m.kind === "image" ? m.url : null;
          return (
            <div key={m.id} className="group card relative overflow-hidden">
              <div className="relative aspect-square bg-surface-2">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={m.title ?? ""} className="absolute inset-0 size-full object-cover" loading="lazy" />
                ) : (
                  <video src={`${m.url}#t=0.5`} muted preload="metadata" className="absolute inset-0 size-full object-cover" />
                )}
                {m.kind !== "image" && (
                  <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-accent text-white">
                    <Play className="size-3 fill-current" />
                  </span>
                )}
                {m.is_featured && <Star className="absolute top-2 left-2 size-5 fill-amber text-amber drop-shadow" aria-label="Featured" />}
              </div>
              <div className="flex items-center gap-1 p-2">
                <div className="min-w-0 flex-1 px-1">
                  <p className="truncate text-xs font-medium">{m.title || "Untitled"}</p>
                  <p className="truncate text-[11px] text-muted">{m.category}</p>
                </div>
                <IconButton label="Edit" onClick={() => setEditing({ ...m, title: m.title ?? "" })}>
                  <Pencil className="size-3.5" />
                </IconButton>
                <IconButton label="Delete" tone="danger" disabled={pending} onClick={() => confirmDelete("this item") && run(() => deleteMedia(m.id), "Removed")}>
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
            </div>
          );
        })}
        {media.length === 0 && <p className="card col-span-full p-10 text-center text-sm text-muted">The gallery is empty. Upload your first photos above.</p>}
      </div>

      <Drawer
        open={!!editing}
        title="Edit media"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={() => editing && run(() => saveMedia(editing), "Saved", () => setEditing(null))}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </>
        }
      >
        {editing && (
          <>
            <TextInput label="Title / caption" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Fortuner, full-body matte PPF" />
            <TextInput label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} list="gallery-cats" />
            <Toggle label="Featured on home page" checked={editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
            <NumberInput label="Display order" value={editing.sort_order} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
            <p className="break-all text-xs text-muted">{editing.url}</p>
          </>
        )}
      </Drawer>
    </div>
  );
}

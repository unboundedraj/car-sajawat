"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { youtubeEmbed, youtubeThumb } from "@/lib/media";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "image" | "video";

export function GalleryGrid({ media }: { media: MediaAsset[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(() => ["All", ...new Set(media.map((m) => m.category))], [media]);
  const visible = media.filter(
    (m) =>
      (filter === "all" || (filter === "image" ? m.kind === "image" : m.kind !== "image")) &&
      (category === "All" || m.category === category),
  );

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const current = open !== null ? visible[open] : null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
          {(
            [
              ["all", "All"],
              ["image", "Photos"],
              ["video", "Videos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "rounded-full px-5 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors",
                filter === value ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {categories.length > 2 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                  category === c ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card mt-10 flex flex-col items-center gap-3 p-14 text-center text-muted">
          <ImageIcon className="size-10 text-accent/60" />
          <p>No {filter === "all" ? "media" : filter === "image" ? "photos" : "videos"} here yet. Follow our work on Instagram!</p>
        </div>
      ) : (
        <div className="mt-10 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          {visible.map((m, i) => {
            const thumb = m.kind === "youtube" ? youtubeThumb(m.url) : m.kind === "image" ? m.url : null;
            return (
              <motion.button
                key={m.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03 }}
                onClick={() => setOpen(i)}
                className="group relative mb-3 block w-full overflow-hidden rounded-2xl border border-line bg-surface-2 sm:mb-4"
                aria-label={`Open ${m.title ?? m.kind}`}
              >
                <div className={cn("relative w-full", i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]")}>
                  {thumb ? (
                    <SmartImage
                      src={thumb}
                      alt={m.title ?? "Car Sajawat work"}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <video src={`${m.url}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {m.kind !== "image" && (
                  <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-accent text-accent-fg">
                    <Play className="size-4 fill-current" />
                  </span>
                )}
                {m.title && (
                  <span className="absolute right-3 bottom-3 left-3 text-left text-sm font-semibold text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {m.title}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title ?? "Media viewer"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 backdrop-blur"
            onClick={() => setOpen(null)}
          >
            <button type="button" aria-label="Close" className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setOpen(null)}>
              <X className="size-5" />
            </button>
            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
            <motion.figure
              key={current.id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {current.kind === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.url} alt={current.title ?? ""} className="max-h-[80vh] w-auto rounded-xl object-contain" />
              )}
              {current.kind === "video" && <video src={current.url} controls autoPlay playsInline className="max-h-[80vh] w-full rounded-xl" />}
              {current.kind === "youtube" && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <iframe
                    src={youtubeEmbed(current.url, true) ?? undefined}
                    title={current.title ?? "Video"}
                    className="absolute inset-0 size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {current.title && <figcaption className="mt-4 text-center text-sm text-white/80">{current.title}</figcaption>}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

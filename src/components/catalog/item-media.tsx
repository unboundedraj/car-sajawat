"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { youtubeEmbed, youtubeThumb } from "@/lib/media";
import { cn } from "@/lib/utils";

type Slide = { type: "image" | "video" | "youtube"; url: string };

export function ItemMedia({ name, images, videos }: { name: string; images: string[]; videos: string[] }) {
  const slides: Slide[] = [
    ...images.map((url) => ({ type: "image" as const, url })),
    ...videos.map((url) => ({ type: youtubeEmbed(url) ? ("youtube" as const) : ("video" as const), url })),
  ];
  const [active, setActive] = useState(0);
  if (slides.length === 0) return null;
  const current = slides[Math.min(active, slides.length - 1)];

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-3xl border border-line bg-black">
        {current.type === "image" && (
          <SmartImage src={current.url} alt={name} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" preload />
        )}
        {current.type === "video" && (
          <video key={current.url} src={current.url} controls playsInline className="absolute inset-0 size-full object-contain" />
        )}
        {current.type === "youtube" && (
          <iframe
            key={current.url}
            src={youtubeEmbed(current.url)!}
            title={`${name} video`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      {slides.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {slides.map((s, i) => {
            const thumb = s.type === "image" ? s.url : s.type === "youtube" ? youtubeThumb(s.url) : null;
            return (
              <button
                key={`${s.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show media ${i + 1}`}
                className={cn(
                  "relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-2 transition-colors",
                  i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                {thumb ? (
                  <SmartImage src={thumb} alt="" fill sizes="112px" className="object-cover" />
                ) : (
                  <video src={`${s.url}#t=0.5`} muted preload="metadata" className="absolute inset-0 size-full object-cover" />
                )}
                {s.type !== "image" && (
                  <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                    <Play className="size-5 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

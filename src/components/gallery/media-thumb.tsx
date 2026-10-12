import { SmartImage } from "@/components/ui/smart-image";
import { youtubeThumb } from "@/lib/media";
import type { MediaAsset } from "@/lib/types";

/**
 * Gallery tile content. Photos keep their own proportions (nothing is cropped and the
 * tile can never collapse); videos and YouTube links sit in a 16:9 frame.
 */
export function MediaThumb({ media: m, sizes }: { media: MediaAsset; sizes: string }) {
  const alt = m.title ?? "Car Sajawat work";

  if (m.kind === "image") {
    return (
      <SmartImage
        src={m.url}
        alt={alt}
        width={0}
        height={0}
        sizes={sizes}
        style={{ width: "100%", height: "auto" }}
        className="block bg-surface-2 transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  const thumb = m.kind === "youtube" ? youtubeThumb(m.url) : null;
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-surface-2">
      {thumb ? (
        <SmartImage src={thumb} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <video src={`${m.url}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  );
}

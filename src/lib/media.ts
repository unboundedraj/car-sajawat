// Keep in sync with images.remotePatterns in next.config.ts
const OPTIMIZED_IMAGE_HOSTS = [/\.supabase\.co$/, /^i\.ytimg\.com$/];

/** next/image can only optimise hosts allowed in next.config.ts; others render as plain <img>. */
export function canOptimizeImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const { hostname } = new URL(src);
    return OPTIMIZED_IMAGE_HOSTS.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const match = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/);
      return match?.[1] ?? null;
    }
  } catch {}
  return null;
}

export function youtubeThumb(url: string) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeEmbed(url: string, autoplay = false) {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? "&autoplay=1" : ""}` : null;
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

import Link from "next/link";
import { Zap } from "lucide-react";
import type { Offer } from "@/lib/types";

/** Infinite marquee of admin-managed offers, shown right under the hero. */
export function OfferStrip({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;
  // Repeat so the track is always wider than the viewport, then duplicate for a seamless loop
  const base = Array.from({ length: Math.max(1, Math.ceil(6 / offers.length)) }, () => offers).flat();
  const track = [...base, ...base];
  const duration = `${Math.max(20, base.length * 7)}s`;

  return (
    <section aria-label="Current offers" className="relative z-10 -rotate-1 scale-[1.02] bg-accent text-accent-fg shadow-[0_20px_60px_-20px_var(--glow)]">
      <div className="group flex overflow-hidden py-3.5 sm:py-4">
        <ul
          className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]"
          style={{ ["--marquee-duration" as string]: duration }}
        >
          {track.map((offer, i) => {
            const content = (
              <>
                {offer.badge && (
                  <span className="rounded-full bg-gold-bright px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-gold-fg">
                    {offer.badge}
                  </span>
                )}
                <span className="font-display text-base font-semibold uppercase tracking-wide sm:text-lg">
                  {offer.title}
                </span>
                <Zap className="size-4 fill-current opacity-70" />
              </>
            );
            return (
              <li key={`${offer.id}-${i}`} aria-hidden={i >= base.length ? true : undefined} className="px-5 sm:px-8">
                {offer.link_url ? (
                  <Link
                    href={offer.link_url}
                    tabIndex={i >= base.length ? -1 : undefined}
                    className="flex items-center gap-3 whitespace-nowrap hover:underline"
                  >
                    {content}
                  </Link>
                ) : (
                  <span className="flex items-center gap-3 whitespace-nowrap">{content}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

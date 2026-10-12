"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import type { HeroContent } from "@/lib/types";
import { splitHighlight } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroBackdrop({ hero }: { hero: HeroContent }) {
  if (hero.mediaType === "video" && hero.mediaUrl) {
    return (
      <video
        className="absolute inset-0 size-full object-cover"
        src={hero.mediaUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
    );
  }
  if (hero.mediaType === "image" && hero.mediaUrl) {
    return <SmartImage src={hero.mediaUrl} alt="" fill preload sizes="100vw" className="object-cover" />;
  }
  // No media yet: an animated "studio" backdrop built from CSS
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute top-1/3 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-20%] h-[30rem] w-[30rem] rounded-full bg-gold/15 blur-[120px]" />
      <div className="absolute top-[-15%] left-[-10%] h-[34rem] w-[34rem] rounded-full bg-navy-2/40 blur-[130px]" />
      {/* light streaks */}
      {[18, 38, 62, 80].map((top, i) => (
        <span
          key={top}
          className="absolute left-0 h-px w-1/2 animate-sweep bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{ top: `${top}%`, animationDelay: `${(i * 1.3).toFixed(1)}s`, animationDuration: `${5 + i}s` }}
        />
      ))}
      <p className="display text-outline absolute inset-x-0 bottom-[8%] text-center text-[15vw] font-bold leading-none whitespace-nowrap opacity-70 select-none lg:text-[13vw]">
        Car Sajawat
      </p>
    </div>
  );
}

export function Hero({ hero }: { hero: HeroContent }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { before, match, after } = splitHighlight(hero.title, hero.highlight);
  const hasMedia = hero.mediaType !== "none" && !!hero.mediaUrl;

  const words = (text: string, offset: number, className?: string) =>
    text.split(/(\s+)/).map((w, i) =>
      /^\s+$/.test(w) ? (
        w
      ) : (
        <span key={`${offset}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={`inline-block ${className ?? ""}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + (offset + i) * 0.05, ease }}
          >
            {w}
          </motion.span>
        </span>
      ),
    );

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-24 pb-16 sm:items-center sm:pb-24">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <HeroBackdrop hero={hero} />
        {hasMedia && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/40 to-transparent" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="container-x relative">
        <motion.p
          className="eyebrow mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {hero.eyebrow}
        </motion.p>

        <h1 className="display max-w-5xl text-[13vw] font-bold sm:text-7xl md:text-8xl lg:text-[8.5rem]">
          {words(before, 0)}
          {match && words(match, before.split(/\s+/).length, "text-accent drop-shadow-[0_0_30px_var(--glow)]")}
          {words(after, before.split(/\s+/).length + match.split(/\s+/).length)}
        </h1>

        <motion.p
          className="mt-6 max-w-xl text-base text-muted sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease }}
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease }}
        >
          {hero.primaryCta.label && (
            <ButtonLink href={hero.primaryCta.href || "/services"} size="lg">
              {hero.primaryCta.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
          )}
          {hero.secondaryCta.label && (
            <ButtonLink href={hero.secondaryCta.href || "/contact"} variant="outline" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          )}
        </motion.div>

        {hero.stats.length > 0 && (
          <motion.dl
            className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-line pt-8 sm:mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.95 }}
          >
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="display text-gold-gradient text-3xl font-bold sm:text-5xl">{s.value}</dd>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </motion.div>

      <a
        href="#services"
        aria-label="Scroll to services"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-fg sm:flex"
      >
        Scroll
        <ChevronDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}

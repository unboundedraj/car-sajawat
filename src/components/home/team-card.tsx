"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "motion/react";
import type { PointerEvent } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import type { TeamMember } from "@/lib/types";

const MAX_TILT = 9; // degrees
const tiltSpring = { stiffness: 170, damping: 17, mass: 0.6 };
const soft = { type: "spring", stiffness: 140, damping: 18 } as const;

// One hover state ("hover") drives every part of the card
const card: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 0 rgba(212,175,55,0)", transition: { type: "spring", stiffness: 220, damping: 22 } },
  hover: { y: -8, boxShadow: "0 32px 60px -24px rgba(212,175,55,0.38)", transition: { type: "spring", stiffness: 260, damping: 18 } },
};
const photo: Variants = {
  rest: { scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  hover: { scale: 1.1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const wash: Variants = {
  rest: { opacity: 0, y: 24, transition: { duration: 0.35 } },
  hover: { opacity: 1, y: 0, transition: soft },
};
const shine: Variants = {
  rest: { x: "-120%", opacity: 0, transition: { duration: 0.2 } },
  hover: { x: "380%", opacity: 1, transition: { x: { duration: 1.1, ease: "easeOut" }, opacity: { duration: 0.15 } } },
};
const underline: Variants = {
  rest: { scaleX: 0, transition: { duration: 0.35 } },
  hover: { scaleX: 1, transition: soft },
};
const divider: Variants = {
  rest: { width: "2rem", transition: { type: "spring", stiffness: 180, damping: 22 } },
  hover: { width: "100%", transition: { type: "spring", stiffness: 120, damping: 17 } },
};
const initialsMark: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.18, rotate: -4, transition: soft },
};

/**
 * Team member card (Motion). Full colour at rest; on hover it springs up, tilts in 3D
 * toward the mouse, and the photo zooms with a gold wash, shine sweep and growing underline.
 * Tilt is mouse-only and skipped when the visitor prefers reduced motion.
 */
export function TeamCard({ member: m }: { member: TeamMember }) {
  const reduceMotion = useReducedMotion();

  // Pointer position inside the card, 0..1 (0.5 = centre)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), tiltSpring);
  const glowX = useSpring(useTransform(px, (v) => v * 100), { stiffness: 120, damping: 20 });
  const glowY = useSpring(useTransform(py, (v) => v * 100), { stiffness: 120, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(226,189,85,0.28), transparent 55%)`;

  function onMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const initials = m.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.article
      variants={card}
      initial="rest"
      animate="rest"
      whileHover="hover"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group card relative h-full overflow-hidden transition-colors duration-300 hover:border-gold/60"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        {m.photo_url ? (
          <motion.div variants={photo} className="absolute inset-0">
            <SmartImage
              src={m.photo_url}
              alt={m.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="grid-bg absolute inset-0 grid place-items-center">
            <motion.span variants={initialsMark} className="display text-gold-gradient text-6xl font-bold">
              {initials}
            </motion.span>
          </div>
        )}

        {/* Gold wash rising from the bottom of the photo */}
        <motion.div aria-hidden variants={wash} className="pointer-events-none absolute inset-0 bg-linear-to-t from-gold/35 via-transparent to-transparent" />
        {/* Shine sweeping across the photo */}
        <motion.span
          aria-hidden
          variants={shine}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/35 to-transparent"
        />
        {/* Gold underline growing from the centre */}
        <motion.div
          aria-hidden
          variants={underline}
          className="absolute inset-x-0 bottom-0 h-1 origin-center bg-linear-to-r from-gold via-gold-bright to-gold"
        />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="display mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-gold sm:mb-2.5 sm:text-2xl">{m.name}</h3>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">{m.role}</p>
        {/* Divider that springs out to full width */}
        <motion.span aria-hidden variants={divider} className="mt-3 block h-px max-w-full bg-linear-to-r from-gold to-accent" />
        {m.bio && <p className="mt-3 text-sm text-muted">{m.bio}</p>}
      </div>

      {/* Gold light that follows the pointer */}
      <motion.div
        aria-hidden
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0"
      />
    </motion.article>
  );
}

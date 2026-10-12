"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SCROLL_MS = 1000;

/** Bottom-left "back to top" button with a gold scroll-progress ring. */
export function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        setVisible(window.scrollY > 500);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /** Eased 1-second scroll to the top; any wheel/touch/key input hands control back to the user. */
  function toTop() {
    const start = window.scrollY;
    if (start <= 0) return;
    const t0 = performance.now();
    let frame = 0;

    const cancel = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / SCROLL_MS);
      // easeInOutCubic: gentle start, quicker middle, soft landing
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      // "instant" so the html { scroll-behavior: smooth } rule doesn't fight each frame
      window.scrollTo({ top: Math.round(start * (1 - eased)), behavior: "instant" });
      if (p < 1) frame = requestAnimationFrame(step);
      else cancel();
    };
    frame = requestAnimationFrame(step);
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Scroll to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "group fixed bottom-4 left-4 z-40 grid size-14 place-items-center rounded-full border border-line-strong bg-surface/80 text-fg shadow-xl backdrop-blur transition-all duration-300 hover:border-gold sm:bottom-6 sm:left-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="2.5" />
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}

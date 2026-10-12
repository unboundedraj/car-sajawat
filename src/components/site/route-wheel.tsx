"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const MIN_VISIBLE_MS = 750; // long enough to read as a deliberate transition
const MAX_VISIBLE_MS = 10_000; // safety net if a navigation never completes

/** Five tapered spokes, rotated around the hub */
const SPOKES = [0, 72, 144, 216, 288];

export function Wheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="rw-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f5" />
          <stop offset="0.5" stopColor="#9a9aa3" />
          <stop offset="1" stopColor="#e4e4e7" />
        </linearGradient>
        <radialGradient id="rw-disc" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#3a3a40" />
          <stop offset="1" stopColor="#1d1d21" />
        </radialGradient>
      </defs>

      {/* Spinning: tyre, brake disc */}
      <g className="origin-center animate-[spin_0.55s_linear_infinite] [transform-box:fill-box]">
        <circle cx="100" cy="100" r="96" fill="#0d0d0f" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#26262b" strokeWidth="12" strokeDasharray="7 5" />
        <circle cx="100" cy="100" r="80" fill="#151518" />
        <circle cx="100" cy="100" r="60" fill="url(#rw-disc)" />
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i * 20 * Math.PI) / 180;
          return <circle key={i} cx={100 + Math.cos(a) * 50} cy={100 + Math.sin(a) * 50} r="1.8" fill="#121214" />;
        })}
      </g>

      {/* Static: brake caliper stays put while the wheel turns */}
      <path d="M150 52 A64 64 0 0 1 165 92 L150 95 A48 48 0 0 0 139 63 Z" fill="var(--accent)" />
      <text x="150" y="80" fontSize="8" fontWeight="700" fill="#fff" transform="rotate(62 150 80)" textAnchor="middle" fontFamily="var(--font-display)">
        CS
      </text>

      {/* Spinning: rim + spokes + hub */}
      <g className="origin-center animate-[spin_0.55s_linear_infinite] [transform-box:fill-box]">
        <circle cx="100" cy="100" r="78" fill="none" stroke="url(#rw-metal)" strokeWidth="5" />
        {SPOKES.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 100 100)`}>
            <path d="M93 84 L88 26 Q100 21 112 26 L107 84 Z" fill="url(#rw-metal)" />
            <path d="M98 80 L96 32 L104 32 L102 80 Z" fill="#0d0d0f" opacity="0.35" />
          </g>
        ))}
        <circle cx="100" cy="100" r="19" fill="url(#rw-metal)" />
        {SPOKES.map((deg) => {
          const a = ((deg + 36) * Math.PI) / 180;
          return <circle key={deg} cx={100 + Math.cos(a) * 13} cy={100 + Math.sin(a) * 13} r="2.6" fill="#2a2a2f" />;
        })}
        <circle cx="100" cy="100" r="10" fill="var(--gold-bright)" />
        <circle cx="100" cy="100" r="7" fill="var(--accent)" />
      </g>
    </svg>
  );
}

/**
 * Full-screen spinning-wheel overlay shown between page navigations.
 * Starts on internal link clicks / back-forward, ends once the new route has
 * rendered (pathname change) and the minimum display time has passed.
 */
export function RouteWheel() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);
  const fromPath = useRef(pathname);
  const failsafe = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const start = () => {
      startedAt.current = Date.now();
      setActive(true);
      clearTimeout(failsafe.current);
      failsafe.current = setTimeout(() => setActive(false), MAX_VISIBLE_MS);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page: hash links, query tabs
      if (url.pathname.startsWith("/api") || /\.[a-z0-9]+$/i.test(url.pathname)) return; // files like /catalog.pdf
      start();
    };
    const onPop = () => {
      if (location.pathname !== fromPath.current) start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clearTimeout(failsafe.current);
    };
  }, []);

  // New route rendered → hold briefly so the wheel completes a visible spin, then hide
  useEffect(() => {
    fromPath.current = pathname;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));
    const t = setTimeout(() => {
      setActive(false);
      clearTimeout(failsafe.current);
    }, wait);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="route-wheel"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-bg/85 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center">
            {/* speed streaks trailing behind the wheel */}
            <div aria-hidden className="absolute top-1/2 right-1/2 -z-10 mr-10 flex -translate-y-1/2 flex-col items-end gap-3 sm:mr-14">
              {[56, 96, 72, 120, 64].map((w, i) => (
                <span
                  key={i}
                  className="h-0.5 rounded-full bg-gradient-to-l from-accent to-transparent opacity-80"
                  style={{ width: w, animation: `wheel-streak 0.6s ${i * 0.09}s ease-in infinite` }}
                />
              ))}
            </div>
            <motion.div
              initial={{ x: -60, rotate: -90, opacity: 0 }}
              animate={{ x: 0, rotate: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <Wheel className="size-32 drop-shadow-[0_12px_30px_var(--glow)] sm:size-40" />
            </motion.div>
            {/* road shadow */}
            <span aria-hidden className="mt-2 h-2 w-28 rounded-full bg-black/30 blur-sm dark:bg-black/60" />
            <p className="mt-5 font-display text-xs font-semibold uppercase tracking-[0.4em] text-gold">Shifting gears</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * reducedMotion="user": Motion skips transform/layout animations for visitors
 * with "Reduce motion" turned on. Handling it here (instead of branching on
 * useReducedMotion() while rendering) keeps server and client HTML identical.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

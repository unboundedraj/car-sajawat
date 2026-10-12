"use client";

import { Toaster as Sonner } from "sonner";
import { useResolvedTheme } from "./theme-store";

export function Toaster() {
  const theme = useResolvedTheme();
  return <Sonner theme={theme} position="top-center" richColors closeButton />;
}

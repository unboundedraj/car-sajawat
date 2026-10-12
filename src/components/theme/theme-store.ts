"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_THEME, THEME_KEY, type ThemePreference } from "./theme-config";

export type { ThemePreference };

const listeners = new Set<() => void>();

function read(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function isDark(pref: ThemePreference) {
  return pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyTheme(pref: ThemePreference) {
  const dark = isDark(pref);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {}
  applyTheme(pref);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (read() === "system") applyTheme("system");
    listener();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) {
      applyTheme(read());
      listener();
    }
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

export function useThemePreference() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_THEME);
}

export function useResolvedTheme(): "light" | "dark" {
  const pref = useThemePreference();
  return useSyncExternalStore(
    subscribe,
    () => (isDark(pref) ? "dark" : "light"),
    () => "dark",
  );
}

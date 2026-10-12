// Shared by the server layout (inline script) and the client theme store.
export type ThemePreference = "light" | "dark" | "system";
export const THEME_KEY = "cs-theme";
export const DEFAULT_THEME: ThemePreference = "dark";

/**
 * Runs in <head> before first paint so there is no light/dark flash.
 * Must stay in sync with applyTheme() in theme-store.ts.
 */
export const themeScript = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"${DEFAULT_THEME}";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

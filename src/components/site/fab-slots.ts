// Vertical stack of floating buttons on the right edge (bottom → top):
// Instagram, WhatsApp, chat. Buttons that aren't configured are skipped, so
// each one is placed by its slot index. Full class strings keep Tailwind happy.
export const FAB_SLOT = ["bottom-4 sm:bottom-6", "bottom-22 sm:bottom-24", "bottom-40 sm:bottom-42"] as const;

/** Chat panel sits just above the chat button in the given slot */
export const CHAT_PANEL_SLOT = [
  "bottom-22 sm:bottom-24 max-h-[min(calc(100dvh-10rem),620px)]",
  "bottom-40 sm:bottom-42 max-h-[min(calc(100dvh-14.5rem),620px)]",
  "bottom-58 sm:bottom-60 max-h-[min(calc(100dvh-19rem),620px)]",
] as const;

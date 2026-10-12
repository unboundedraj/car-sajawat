"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Globe, MessageCircle, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { CHAT_PANEL_SLOT, FAB_SLOT } from "@/components/site/fab-slots";
import { EnquiryLink } from "@/components/site/enquiry-dialog";
import { splitSources, type ChatSources } from "@/lib/chat-sources";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "model"; text: string };

/** Tiny formatter for model replies: **bold**, bullet lists, paragraphs, internal links. */
const linkClass = "font-medium text-accent underline underline-offset-2";
// Only site-internal links are rendered as links; anything else stays plain text
const INTERNAL = /^\/(services|catalog\.pdf|contact|gallery)/;

/** Tiny formatter for model replies: **bold**, [text](/internal-link), bare /services/… and /catalog.pdf paths. */
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\/services\/[a-z0-9-]+|\/catalog\.pdf)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{renderInline(part.slice(2, -2))}</strong>;
    const md = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (md) {
      return INTERNAL.test(md[2]) ? (
        <a key={i} href={md[2]} className={linkClass}>
          {md[1]}
        </a>
      ) : (
        <Fragment key={i}>{md[1]}</Fragment>
      );
    }
    if (part.startsWith("/services/") || part === "/catalog.pdf")
      return (
        <a key={i} href={part} className={linkClass}>
          {part === "/catalog.pdf" ? "PDF catalogue" : part}
        </a>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Web sources behind a researched answer (Google Search grounding) */
function Sources({ sources }: { sources: ChatSources }) {
  if (!sources.links.length && !sources.searchSuggestionsHtml) return null;
  return (
    <div className="mt-3 border-t border-line pt-2.5">
      {sources.links.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-muted uppercase">
            <Globe className="size-3" /> From the web
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {sources.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block max-w-[11rem] truncate rounded-full border border-line bg-bg px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
                  title={l.title}
                >
                  {l.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {sources.searchSuggestionsHtml && (
        // Google's required "Search Suggestions" bar, isolated in a script-free sandboxed frame
        <iframe
          title="Google Search suggestions"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={sources.searchSuggestionsHtml}
          className="mt-2 h-14 w-full rounded-lg border-0"
        />
      )}
    </div>
  );
}

function ModelMessage({ text }: { text: string }) {
  const { answer, sources } = splitSources(text);
  return (
    <>
      <FormattedText text={answer} />
      {sources && <Sources sources={sources} />}
    </>
  );
}

function FormattedText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          return (
            <ul key={bi} className="my-1 list-disc space-y-1 pl-4">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="mb-2 last:mb-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function ChatWidget({
  slot,
  assistantName,
  greeting,
  suggestions,
  whatsapp,
}: {
  /** Position in the floating-button stack (0 = bottom) */
  slot: number;
  assistantName: string;
  greeting: string;
  suggestions: string[];
  whatsapp: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const content = text.trim().slice(0, 1000);
    if (!content || busy) return;
    const history: Message[] = [...messages, { role: "user", text: content }];
    setMessages([...history, { role: "model", text: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const msg = (await res.text().catch(() => "")) || "Something went wrong. Please try again.";
        setMessages((m) => [...m.slice(0, -1), { role: "model", text: msg }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const text = acc;
        setMessages((m) => [...m.slice(0, -1), { role: "model", text }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((m) => [...m.slice(0, -1), { role: "model", text: "Network error. Please try again." }]);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className={cn(
          "fixed right-4 z-40 grid size-14 place-items-center rounded-full border border-line-strong bg-surface text-fg shadow-xl transition-all duration-300 hover:scale-105 hover:border-accent sm:right-6",
          FAB_SLOT[slot],
          open && "bg-accent text-accent-fg",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="relative">
              <MessageCircle className="size-6" />
              <Sparkles className="absolute -top-2 -right-2.5 size-3.5 text-accent" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={assistantName}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed inset-x-3 z-40 flex flex-col overflow-hidden rounded-3xl border border-line-strong bg-bg-elevated shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[400px]",
              CHAT_PANEL_SLOT[slot],
            )}
          >
            <header className="relative flex items-center gap-3 overflow-hidden border-b border-line px-5 py-4">
              <div aria-hidden className="stripe-bg absolute inset-0 opacity-60" />
              <span className="relative grid size-10 place-items-center rounded-full bg-accent text-accent-fg">
                <Bot className="size-5" />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold uppercase tracking-wide">{assistantName}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> AI assistant · replies instantly
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="relative grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
                  aria-label="Start a new chat"
                  title="New chat"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 text-sm leading-relaxed" aria-live="polite">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3">{greeting}</div>
              {messages.length === 0 && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 text-accent-fg">
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3">
                    {m.text ? (
                      <ModelMessage text={m.text} />
                    ) : (
                      <span className="flex gap-1 py-1" aria-label="Typing">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="border-t border-line p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2 rounded-2xl border border-line bg-surface px-3 py-2 focus-within:border-accent"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={1000}
                  placeholder="Ask about PPF, accessories, timings…"
                  className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
                  aria-label="Message"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg transition-opacity disabled:opacity-40"
                  aria-label="Send"
                >
                  <SendHorizontal className="size-4" />
                </button>
              </form>
              {whatsapp && (
                <EnquiryLink className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-[#25D366]">
                  <WhatsAppIcon className="size-3.5" /> Prefer a human? Chat with us on WhatsApp
                </EnquiryLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

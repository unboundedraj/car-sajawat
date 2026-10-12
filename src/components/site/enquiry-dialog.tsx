"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Send, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { cn, enquiryMessage, formatPhone, whatsappLink, whatsappMessageFrom } from "@/lib/utils";

type Ctx = { enabled: boolean; open: (interest?: string) => void; number: string; businessName: string };
const EnquiryContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "cs-enquiry";
const field =
  "mt-1.5 w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-[#25D366]";

type Values = { name: string; car: string; year: string; requirement: string };
type Errors = Partial<Record<keyof Values, string>>;

/** Wrap the site once. Any <EnquiryLink> inside opens the popup. */
export function EnquiryProvider({ number, businessName, children }: { number: string; businessName: string; children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; interest?: string }>({ open: false });
  const open = useCallback((interest?: string) => setState({ open: true, interest }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const ctx = useMemo<Ctx>(() => ({ enabled: !!number, open, number, businessName }), [number, open, businessName]);

  return (
    <EnquiryContext value={ctx}>
      {children}
      {number && <EnquiryDialog open={state.open} interest={state.interest} number={number} businessName={businessName} onClose={close} />}
    </EnquiryContext>
  );
}

/**
 * A normal link to WhatsApp that, with JavaScript, opens the enquiry popup instead
 * (so the details are typed on this site). Without a WhatsApp number it points at the contact form.
 */
export function EnquiryLink({ interest, onClick, children, ...props }: Omit<ComponentProps<"a">, "href"> & { interest?: string }) {
  const ctx = useContext(EnquiryContext);
  const number = ctx?.number ?? "";
  const href = number ? whatsappLink(number, enquiryMessage(ctx?.businessName ?? "Car Sajawat", interest)) : "/contact#enquiry";

  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || !ctx?.enabled) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // keep "open in new tab"
    e.preventDefault();
    ctx.open(interest);
  }

  return (
    <a href={href} onClick={handle} {...(number ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
      {children}
    </a>
  );
}

const subscribeNothing = () => () => {};

function EnquiryDialog({ open, interest, number, businessName, onClose }: { open: boolean; interest?: string; number: string; businessName: string; onClose: () => void }) {
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("input, textarea")?.focus(), 80);
    const onEsc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    const items = panel.current?.querySelectorAll<HTMLElement>("input, textarea, button:not([disabled]), a[href]");
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line-strong bg-bg-elevated p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-line text-muted hover:text-fg">
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-8px_rgb(37_211_102/0.7)]">
                <WhatsAppIcon className="size-6" />
              </span>
              <div>
                <h2 id={titleId} className="display text-2xl leading-none font-bold">
                  Chat on WhatsApp
                </h2>
                <p className="mt-1 text-xs text-muted">A few details help us reply faster</p>
              </div>
            </div>

            {interest && (
              <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm">
                Enquiring about <strong className="text-gold">{interest}</strong>
              </p>
            )}

            {/* Mounted only while open, so it starts fresh (and pre-filled from this device) every time */}
            <EnquiryForm number={number} businessName={businessName} interest={interest} onDone={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function loadSaved(): Values {
  const empty: Values = { name: "", car: "", year: "", requirement: "" };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object") return { ...empty, name: String(saved.name ?? ""), car: String(saved.car ?? ""), year: String(saved.year ?? "") };
  } catch {}
  return empty;
}

function EnquiryForm({ number, businessName, interest, onDone }: { number: string; businessName: string; interest?: string; onDone: () => void }) {
  const [values, setValues] = useState<Values>(loadSaved);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const v = { name: values.name.trim(), car: values.car.trim(), year: values.year.trim(), requirement: values.requirement.trim() };
    const next: Errors = {};
    if (v.name.length < 2) next.name = "Please enter your name";
    if (v.car.length < 2) next.car = "Enter your car's make and model";
    if (v.year && !/^(19|20)\d{2}$/.test(v.year)) next.year = "Enter a 4-digit year";
    if (v.requirement.length < 3) next.requirement = "Tell us what you're looking for";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: v.name, car: v.car, year: v.year }));
    } catch {}
    // Opened inside the submit handler (a user gesture) so browsers don't block it as a popup
    window.open(whatsappLink(number, whatsappMessageFrom(businessName, v, interest)), "_blank", "noopener,noreferrer");
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
      <Field label="Your name" error={errors.name}>
        <input value={values.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Rahul Verma" className={cn(field, errors.name && "border-accent")} />
      </Field>
      <div className="grid grid-cols-[1fr_6.5rem] gap-3">
        <Field label="Car make & model" error={errors.car}>
          <input value={values.car} onChange={set("car")} placeholder="e.g. Hyundai Creta" className={cn(field, errors.car && "border-accent")} />
        </Field>
        <Field label="Year" error={errors.year}>
          <input value={values.year} onChange={set("year")} inputMode="numeric" maxLength={4} placeholder="2022" className={cn(field, errors.year && "border-accent")} />
        </Field>
      </div>
      <Field label="What are you looking for?" error={errors.requirement}>
        <textarea
          value={values.requirement}
          onChange={set("requirement")}
          rows={3}
          placeholder="e.g. Ambient lights and floor mats, with a price estimate"
          className={cn(field, "resize-none", errors.requirement && "border-accent")}
        />
      </Field>

      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-[#05290f] transition-all hover:-translate-y-0.5 hover:bg-[#2ee676]"
      >
        <Send className="size-4" /> Send on WhatsApp
      </button>
      <p className="text-center text-[11px] text-muted">Opens WhatsApp with your message ready to send to {formatPhone(number)}.</p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold tracking-wider text-muted uppercase">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal tracking-normal text-accent normal-case">{error}</span>}
    </label>
  );
}

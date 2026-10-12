import type { ReactNode } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { cn, whatsappLink } from "@/lib/utils";
import { EnquiryLink } from "./enquiry-dialog";
import { FAB_SLOT } from "./fab-slots";

/** Round floating button with a label that slides in on hover (desktop). */
function Fab({
  href,
  label,
  className,
  bubbleClassName,
  pulse,
  enquiry,
  children,
}: {
  /** WhatsApp button: open the website's enquiry popup instead of leaving the site */
  enquiry?: boolean;
  href: string;
  label: string;
  className: string;
  bubbleClassName: string;
  pulse?: string;
  children: ReactNode;
}) {
  const Link = enquiry ? EnquiryLink : "a";
  return (
    <Link
      {...(enquiry ? {} : { href, ...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {}) })}
      aria-label={label}
      className={cn("group fixed right-4 z-40 flex items-center sm:right-6", className)}
    >
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold whitespace-nowrap opacity-0 shadow-lg ring-1 ring-line transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
        {label}
      </span>
      <span
        className={cn(
          "relative grid size-14 place-items-center rounded-full text-white transition-transform duration-300 group-hover:scale-110",
          bubbleClassName,
        )}
      >
        {pulse && <span aria-hidden className={cn("absolute inset-0 animate-pulse-ring rounded-full", pulse)} />}
        {children}
      </span>
    </Link>
  );
}

/** Always shown; until a WhatsApp number is saved in /admin it opens the enquiry form instead. */
export function WhatsAppFab({ number, message, slot }: { number: string; message: string; slot: number }) {
  return (
    <Fab
      href={number ? whatsappLink(number, message) : "/contact#enquiry"}
      label="Get a quote on WhatsApp"
      className={FAB_SLOT[slot]}
      bubbleClassName="bg-[#25D366] shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)]"
      pulse="bg-[#25D366]"
      enquiry
    >
      <WhatsAppIcon className="relative size-7" />
    </Fab>
  );
}

export function InstagramFab({ url, slot }: { url: string; slot: number }) {
  if (!url) return null;
  return (
    <Fab
      href={url}
      label="Follow us on Instagram"
      className={FAB_SLOT[slot]}
      bubbleClassName="bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] shadow-[0_10px_30px_-6px_rgb(214_36_159/0.55)]"
    >
      <InstagramIcon className="relative size-7" />
    </Fab>
  );
}

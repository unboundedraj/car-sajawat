"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, FileDown, Menu, Phone, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo, WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { cn, telLink, whatsappLink } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";


function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar({
  businessName,
  phone,
  whatsapp,
  whatsappMessage,
}: {
  businessName: string;
  phone: string;
  whatsapp: string;
  whatsappMessage: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overHero ? "border-b border-transparent bg-transparent" : "glass border-b shadow-[0_8px_30px_-20px_rgb(0_0_0/0.5)]",
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4 lg:h-20" aria-label="Primary">
        <Link href="/" className="shrink-0" aria-label={`${businessName} home`} onClick={() => setOpen(false)}>
          <Logo name={businessName} preload />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left bg-accent transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <a
            href="/catalog.pdf"
            download
            title="Download catalogue (PDF)"
            aria-label="Download catalogue (PDF)"
            className={buttonClasses({ variant: "outline", size: "sm", className: "size-10 px-0 xl:w-auto xl:px-4" })}
          >
            <FileDown className="size-4" />
            <span className="hidden xl:inline">Catalogue</span>
          </a>
          {whatsapp ? (
            <a
              href={whatsappLink(whatsapp, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ size: "sm", className: "hidden md:inline-flex" })}
            >
              Get a quote <ArrowUpRight className="size-4" />
            </a>
          ) : (
            <Link href="/contact" className={buttonClasses({ size: "sm", className: "hidden md:inline-flex" })}>
              Contact us <ArrowUpRight className="size-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line text-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-line bg-bg lg:hidden"
          >
            <div className="container-x flex min-h-full flex-col py-8">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line py-4"
                    >
                      <span className="display text-3xl font-semibold sm:text-4xl">{link.label}</span>
                      <ArrowUpRight className="size-5 text-accent" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pt-10">
                {whatsapp && (
                  <a
                    href={whatsappLink(whatsapp, whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: "whatsapp", size: "lg" })}
                  >
                    <WhatsAppIcon className="size-5" /> Chat on WhatsApp
                  </a>
                )}
                <a href="/catalog.pdf" download className={buttonClasses({ variant: "outline", size: "lg" })}>
                  <FileDown className="size-4" /> Download catalogue (PDF)
                </a>
                {phone && (
                  <a href={telLink(phone)} className={buttonClasses({ variant: "outline", size: "lg" })}>
                    <Phone className="size-4" /> {phone}
                  </a>
                )}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Clock, FileDown, LockKeyhole, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, Logo, WhatsAppIcon, YouTubeIcon } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import type { ContactContent } from "@/lib/types";
import { CopyText } from "@/components/ui/copy-text";
import { formatPhone, mapDirectionsUrl, mapEmbedUrl, telLink } from "@/lib/utils";
import { EnquiryLink } from "./enquiry-dialog";
import { NAV_LINKS } from "./nav-links";

export function MapEmbed({ contact, className }: { contact: ContactContent; className?: string }) {
  return (
    <iframe
      title={`${contact.businessName} location on Google Maps`}
      src={contact.mapEmbedUrl || mapEmbedUrl(contact.mapQuery || contact.address)}
      className={className}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

const socialClass = "grid size-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:bg-accent hover:text-accent-fg";

type FooterLink = { label: string; href: string; external?: boolean; download?: boolean; enquiry?: boolean; icon?: ReactNode };

function Column({ title, links, className }: { title: string; links: FooterLink[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest">
        <span className="h-3 w-0.5 rounded-full bg-gold" />
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm text-muted">
        {links.map((l) => {
          const cls = "group inline-flex items-center gap-1.5 transition-colors hover:text-accent";
          const content = (
            <>
              {l.icon}
              {l.label}
              {l.external && <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />}
            </>
          );
          return (
            <li key={`${l.label}-${l.href}`}>
              {l.enquiry ? (
                <EnquiryLink className={cls}>{content}</EnquiryLink>
              ) : l.external || l.download ? (
                <a
                  href={l.href}
                  className={cls}
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  {...(l.download ? { download: true } : {})}
                >
                  {content}
                </a>
              ) : (
                <Link href={l.href} className={cls}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer({
  contact,
  year,
  services,
}: {
  contact: ContactContent;
  year: number;
  /** Featured/first services from the catalog, for the Services column */
  services: { name: string; slug: string }[];
}) {
  const directions = mapDirectionsUrl(contact.mapQuery || contact.address);
  const socials = [
    { href: contact.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: contact.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: contact.youtube, label: "YouTube", Icon: YouTubeIcon },
    { href: contact.whatsapp ? "#whatsapp" : "", label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter((s) => s.href);

  const serviceLinks: FooterLink[] = [
    ...services.slice(0, 5).map((s) => ({ label: s.name, href: `/services/${s.slug}` })),
    { label: "Accessories & products", href: "/services" },
    { label: services.length ? "All services" : "Services", href: "/services?tab=service" },
  ];

  const helpLinks: FooterLink[] = [
    contact.whatsapp
      ? { label: "Get a quote on WhatsApp", href: "#whatsapp", enquiry: true }
      : { label: "Get a quote", href: "/contact" },
    { label: "Request a callback", href: "/contact#enquiry" },
    { label: "PDF catalogue", href: "/catalog.pdf", download: true },
    { label: "See our work", href: "/gallery" },
    { label: "Get directions", href: directions, external: true },
    ...(contact.instagram ? [{ label: "Follow on Instagram", href: contact.instagram, external: true }] : []),
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-bg-elevated">
      <div aria-hidden className="gold-rule absolute inset-x-0 top-0 opacity-70" />
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-240 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-x relative grid grid-cols-2 gap-x-6 gap-y-10 pt-16 pb-12 lg:grid-cols-12 lg:gap-x-10 lg:pt-20">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-4">
          <Logo name={contact.businessName} size={64} />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{contact.tagline}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  {label === "WhatsApp" ? (
                    <EnquiryLink aria-label={label} className={socialClass}>
                      <Icon className="size-4" />
                    </EnquiryLink>
                  ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={socialClass}>
                      <Icon className="size-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <a href="/catalog.pdf" download className={buttonClasses({ variant: "outline", size: "sm", className: "mt-6" })}>
            <FileDown className="size-4" /> Download catalogue
          </a>
        </div>

        <Column title="Explore" links={NAV_LINKS} className="lg:col-span-2" />
        <Column title="Services" links={serviceLinks} className="lg:col-span-2" />
        <Column title="Help" links={helpLinks} className="lg:col-span-2" />

        {/* Contact */}
        <div className="lg:col-span-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest">
            <span className="h-3 w-0.5 rounded-full bg-gold" />
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              <a href={directions} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-accent">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{contact.address}</span>
              </a>
            </li>
            {contact.phone && (
              <li>
                <a href={telLink(contact.phone)} className="flex gap-2 hover:text-accent">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <CopyText value={formatPhone(contact.whatsapp)} label="phone number" />
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="flex gap-2 break-all hover:text-accent">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  {contact.email}
                </a>
              </li>
            )}
            {contact.hours.filter((h) => h.days.trim() || h.time.trim()).map((h) => (
              <li key={h.days} className="flex gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  <span className="block text-fg">{h.days}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Map strip */}
      <div className="container-x relative pb-14">
        <div className="relative overflow-hidden rounded-2xl border border-line">
          <MapEmbed contact={contact} className="h-56 w-full grayscale-[0.4] sm:h-64 dark:hue-rotate-180 dark:invert-[0.9]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <MapPin className="size-4 text-accent" /> {contact.businessName} · {contact.address}
            </p>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-fg shadow-lg"
            >
              <Navigation className="size-3.5" /> Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line">
        <div className="container-x grid items-center gap-3 py-6 text-center text-xs text-muted sm:grid-cols-3">
          <p className="font-display uppercase tracking-[0.3em] sm:text-left">Protect · Style · Perform</p>
          <p>
            © {year} {contact.businessName}. All rights reserved.
          </p>
          <Link
            href="/admin"
            prefetch={false}
            className="inline-flex items-center justify-center gap-1.5 justify-self-center rounded-full border border-line px-3 py-1.5 transition-colors hover:border-accent hover:text-accent sm:justify-self-end"
          >
            <LockKeyhole className="size-3.5" /> Admin
          </Link>
        </div>
      </div>
      <p aria-hidden className="display text-outline pointer-events-none relative mb-[-0.18em] text-center text-[13vw] font-bold leading-none whitespace-nowrap select-none">
        Car Sajawat
      </p>
    </footer>
  );
}

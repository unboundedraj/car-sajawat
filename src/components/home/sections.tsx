import Link from "next/link";
import { ArrowRight, Check, Phone, Play, Quote, Star } from "lucide-react";
import { CatalogCard, CategoryIcon } from "@/components/catalog/catalog-card";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartImage } from "@/components/ui/smart-image";
import type { AboutContent, CatalogItem, ContactContent, MediaAsset, TeamMember, Testimonial } from "@/lib/types";
import { masonryClass, telLink } from "@/lib/utils";
import { EnquiryLink } from "@/components/site/enquiry-dialog";
import { MediaThumb } from "@/components/gallery/media-thumb";
import { TeamCard } from "./team-card";

// ── Services: bento grid ────────────────────────────────────

export function ServicesShowcase({ services }: { services: CatalogItem[] }) {
  if (services.length === 0) return null;
  const featured = services.filter((s) => s.is_featured);
  const list = (featured.length ? featured : services).slice(0, 6);

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Services that <span className="text-accent">protect</span> &amp; transform
            </>
          }
          description="From invisible protection to complete makeovers, every service is done in-house by trained specialists."
          action={
            <ButtonLink href="/services?tab=service" variant="outline">
              All services <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="grid auto-rows-[minmax(220px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {list.map((s, i) => {
            const big = i === 0 || i === 3;
            return (
              <Reveal
                key={s.id}
                delay={(i % 3) * 0.08}
                className={big ? "sm:col-span-2 lg:col-span-4 lg:row-span-1" : "lg:col-span-2"}
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="group card relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden p-6 transition-all duration-500 hover:border-accent/60 sm:p-8"
                >
                  {(s.cover_image || s.images[0]) && (
                    <>
                      <SmartImage
                        src={s.cover_image || s.images[0]}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className="object-cover opacity-40 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
                    </>
                  )}
                  <div className="absolute -top-20 -right-20 size-56 rounded-full bg-accent/0 blur-3xl transition-all duration-700 group-hover:bg-accent/25" />
                  <div className="relative flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-xl border border-line bg-bg/60 text-accent backdrop-blur transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-fg">
                      <CategoryIcon category={s.category} className="size-6" />
                    </span>
                    <span className="font-display text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="relative mt-10">
                    <h3 className={`display font-bold ${big ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>{s.name}</h3>
                    {s.tagline && <p className="mt-2 max-w-md text-sm text-muted">{s.tagline}</p>}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Products ────────────────────────────────────────────────

export function FeaturedProducts({ products }: { products: CatalogItem[] }) {
  if (products.length === 0) return null;
  const featured = products.filter((p) => p.is_featured);
  const list = (featured.length ? featured : products).slice(0, 4);
  return (
    <section className="relative border-y border-line bg-bg-elevated py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Accessories"
          title="Upgrades in stock"
          description="Hand-picked accessories with professional fitting, matched to your car's make and model."
          action={
            <ButtonLink href="/services" variant="outline">
              Shop accessories <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <CatalogCard item={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About ───────────────────────────────────────────────────

export function AboutSection({ about }: { about: AboutContent }) {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2 sm:aspect-[5/4] lg:aspect-[4/5]">
            {about.image ? (
              <SmartImage src={about.image} alt="Inside the Car Sajawat studio" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0">
                <div className="grid-bg absolute inset-0" />
                <div className="absolute inset-0 bg-linear-to-br from-navy-2/50 via-transparent to-gold/15" />
                <p className="display text-outline absolute inset-0 grid place-items-center text-[9rem] font-bold leading-none sm:text-[12rem]">CS</p>
              </div>
            )}
          </div>
          {about.badgeValue && (
            <div className="navy-band absolute -right-2 -bottom-6 animate-float rounded-2xl border border-gold/40 px-6 py-5 shadow-[0_20px_50px_-15px_var(--gold-glow)] sm:-right-6">
              <p className="display text-gold-gradient text-5xl font-bold">{about.badgeValue}</p>
              <p className="text-xs font-semibold uppercase tracking-widest">{about.badgeLabel}</p>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow mb-4">{about.eyebrow}</p>
          <h2 className="display text-4xl font-bold sm:text-5xl lg:text-6xl">{about.title}</h2>
          <div className="mt-6 space-y-4 text-muted sm:text-lg">
            {about.body.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {about.highlights.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {about.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm font-medium">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3.5" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ── Process ─────────────────────────────────────────────────

const STEPS = [
  { title: "Consult", text: "Tell us about your car and how you drive it. We inspect and recommend." },
  { title: "Quote", text: "A clear quote with product options to choose from." },
  { title: "Craft", text: "Specialists get to work in our studio, with updates as we go." },
  { title: "Deliver", text: "A walkthrough of the finished job and tips to keep it looking new." },
];

export function ProcessSection() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-bg-elevated py-24 sm:py-32">
      <div aria-hidden className="stripe-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="container-x relative">
        <SectionHeading eyebrow="How it works" title="From first call to final shine" align="center" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <article className="card group relative h-full overflow-hidden p-7 transition-colors hover:border-accent/60">
                <span className="display text-outline absolute -top-4 -right-2 text-[7rem] font-bold leading-none transition-colors group-hover:[-webkit-text-stroke-color:var(--gold)]">
                  {i + 1}
                </span>
                <span className="relative block h-1 w-10 rounded-full bg-linear-to-r from-gold to-accent" />
                <h3 className="display relative mt-6 text-3xl font-bold">{step.title}</h3>
                <p className="relative mt-3 text-sm text-muted">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery teaser ──────────────────────────────────────────

export function GalleryTeaser({ media }: { media: MediaAsset[] }) {
  const featured = media.filter((m) => m.is_featured);
  const list = (featured.length ? featured : media).slice(0, 5);
  if (list.length === 0) return null;

  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Gallery"
          title="Fresh out of the studio"
          action={
            <ButtonLink href="/gallery" variant="outline">
              View gallery <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className={masonryClass(list.length)}>
          {list.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.06} className="mb-3 break-inside-avoid sm:mb-4">
              <Link href="/gallery" className="group relative block overflow-hidden rounded-2xl border border-line bg-surface-2">
                <MediaThumb media={m} sizes={list.length < 3 ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {m.kind !== "image" && (
                  <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent/90 text-accent-fg">
                    <Play className="size-5 fill-current" />
                  </span>
                )}
                {m.title && (
                  <p className="absolute right-4 bottom-4 left-4 translate-y-2 text-sm font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {m.title}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ────────────────────────────────────────────

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="Reviews" title="Word on the street" align="center" />
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={(i % 3) * 0.08} className="mb-4 break-inside-avoid">
              <figure className="card relative p-7">
                <Quote className="absolute top-6 right-6 size-8 text-gold/30" />
                <div className="flex gap-0.5 text-gold" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star key={s} className={`size-4 ${s < t.rating ? "fill-current" : "opacity-25"}`} />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed sm:text-base">“{t.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <p className="font-semibold">{t.name}</p>
                  {t.vehicle && <p className="text-xs text-muted">{t.vehicle}</p>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Team ────────────────────────────────────────────────────

export function TeamSection({ team }: { team: TeamMember[] }) {
  return (
    <section id="team" className="relative border-t border-line bg-bg-elevated py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="The crew"
          title="Hands behind the shine"
          description="Installers, detailers and electricians who live and breathe cars."
          align="center"
        />
        {team.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={(i % 4) * 0.08}>
                <TeamCard member={m} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="card mx-auto max-w-2xl p-10 text-center">
            <p className="text-muted">
              Our team of specialists is ready to help. Drop by the studio or message us to talk to an expert.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ── Quote CTA band ──────────────────────────────────────────

export function QuoteCta({ contact }: { contact: ContactContent }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="navy-band relative overflow-hidden rounded-[2rem] border border-gold/25 px-6 py-14 sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0_18px,rgb(226_189_85/0.06)_18px_20px)]" />
          <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-gold-bright/15 blur-3xl" />
          <div aria-hidden className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-gold-bright to-transparent" />
          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-bright">Let&apos;s talk</p>
              <h2 className="display mt-4 text-4xl font-bold sm:text-6xl">
                Ready to give your car the <span className="text-gold-gradient">Sajawat</span> treatment?
              </h2>
              <p className="mt-4 opacity-85 sm:text-lg">Tell us your car model and what you have in mind, and our team will get back to you with options.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
              {contact.whatsapp && (
                <EnquiryLink className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 font-semibold text-black transition-transform hover:-translate-y-0.5">
                  <WhatsAppIcon className="size-5 text-[#25D366]" /> WhatsApp us
                </EnquiryLink>
              )}
              {contact.phone && (
                <a
                  href={telLink(contact.phone)}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/40 px-8 font-semibold transition-colors hover:bg-white/10"
                >
                  <Phone className="size-4" /> {contact.phone}
                </a>
              )}
              {!contact.whatsapp && !contact.phone && (
                <Link
                  href="/contact"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 font-semibold text-black transition-transform hover:-translate-y-0.5"
                >
                  Contact us <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

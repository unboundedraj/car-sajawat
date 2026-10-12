import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Check, Phone } from "lucide-react";
import { CatalogCard, CatalogVisual } from "@/components/catalog/catalog-card";
import { ItemMedia } from "@/components/catalog/item-media";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog, getCatalogItem, getSiteContent } from "@/lib/data";
import { PRICE_DISCLAIMER, formatPrice } from "@/lib/price";
import { telLink } from "@/lib/utils";
import { EnquiryLink } from "@/components/site/enquiry-dialog";

export async function generateStaticParams() {
  const items = await getCatalog();
  // Cache Components requires at least one param at build time
  return items.length ? items.map((i) => ({ slug: i.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCatalogItem(slug);
  if (!item) return { title: "Not found" };
  const image = item.cover_image || item.images[0];
  return {
    title: item.name,
    description: item.tagline || item.description?.slice(0, 160) || undefined,
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default function ItemPage(props: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[80vh] pt-40" />}>
      <ItemDetails params={props.params} />
    </Suspense>
  );
}

async function ItemDetails({ params }: Pick<PageProps<"/services/[slug]">, "params">) {
  const { slug } = await params;
  const [item, catalog, { contact }] = await Promise.all([getCatalogItem(slug), getCatalog(), getSiteContent()]);
  if (!item) notFound();

  const related = catalog.filter((c) => c.kind === item.kind && c.id !== item.id).slice(0, 3);
  const hasMedia = item.images.length > 0 || item.videos.length > 0;
  const price = formatPrice(item);

  return (
    <>
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div aria-hidden className="absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-accent/15 blur-[120px]" />
        <div className="container-x relative">
          <Link href={item.kind === "service" ? "/services?tab=service" : "/services"} className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent">
            <ArrowLeft className="size-4" /> Back to {item.kind === "product" ? "products" : "services"}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-7">
              {hasMedia ? (
                <ItemMedia name={item.name} images={item.cover_image ? [item.cover_image, ...item.images.filter((i) => i !== item.cover_image)] : item.images} videos={item.videos} />
              ) : (
                <CatalogVisual item={item} className="aspect-video rounded-3xl border border-line" sizes="(min-width: 1024px) 60vw, 100vw" />
              )}
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <p className="eyebrow mb-4">
                {item.kind === "product" ? "Product" : "Service"} · {item.category}
              </p>
              <h1 className="display text-5xl font-bold sm:text-6xl">{item.name}</h1>
              {item.tagline && <p className="mt-4 text-lg text-muted">{item.tagline}</p>}
              <div className="mt-6 rounded-2xl border border-gold/35 bg-gold/5 p-5">
                {price ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">Estimated cost</p>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="display text-4xl font-bold text-gold">{price}</span>
                      {item.price_note && <span className="text-sm text-muted">{item.price_note}</span>}
                    </p>
                    <p className="mt-3 text-xs text-muted">{PRICE_DISCLAIMER}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    <span className="block font-semibold text-fg">Price on request</span>
                    Pricing depends on your car model. Message us for an exact figure.
                  </p>
                )}
              </div>

              {item.features.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-fg">
                        <Check className="size-3.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                {contact.whatsapp && (
                  <EnquiryLink interest={item.name} className={buttonClasses({ variant: "whatsapp", size: "lg", className: "flex-1" })}>
                    <WhatsAppIcon className="size-5" /> Enquire on WhatsApp
                  </EnquiryLink>
                )}
                {contact.phone && (
                  <a href={telLink(contact.phone)} className={buttonClasses({ variant: "outline", size: "lg", className: "flex-1" })}>
                    <Phone className="size-4" /> Call us
                  </a>
                )}
                {!contact.whatsapp && !contact.phone && (
                  <Link href="/contact" className={buttonClasses({ size: "lg", className: "flex-1" })}>
                    Enquire about this
                  </Link>
                )}
              </div>
            </Reveal>
          </div>

          {item.description && (
            <Reveal className="mt-16 max-w-3xl">
              <h2 className="display text-3xl font-bold">Details</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-muted sm:text-lg">
                {item.description.split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-bg-elevated py-20">
          <div className="container-x">
            <h2 className="display mb-8 text-3xl font-bold sm:text-4xl">You might also like</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <CatalogCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

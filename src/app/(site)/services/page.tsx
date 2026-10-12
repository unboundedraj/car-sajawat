import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { QuoteCta } from "@/components/home/sections";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getCatalog, getCategories, getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services & Products",
  description:
    "PPF, ceramic coating, wraps, interiors, lighting, audio and premium car accessories, fitted by specialists at Car Sajawat, Mumbai.",
};

export default async function ServicesPage() {
  const [catalog, categories, { contact }] = await Promise.all([getCatalog(), getCategories(), getSiteContent()]);
  const services = catalog.filter((c) => c.kind === "service");

  return (
    <>
      <PageHeader
        eyebrow="Services & products"
        title={
          <>
            Everything your car <span className="text-accent">deserves</span>
          </>
        }
        description="Browse our protection, styling and upgrade services, plus the accessories we stock and fit, with estimated costs. Want it all in one place? Download the PDF catalogue."
        watermark="Garage"
      >
        <a href="/catalog.pdf" download className={buttonClasses({ variant: "outline", className: "mt-8" })}>
          <FileDown className="size-4" /> Download PDF catalogue
        </a>
      </PageHeader>
      <section className="py-16 sm:py-20">
        <div className="container-x">
          {/* useSearchParams (tab) needs a boundary; the fallback is the static services grid */}
          <Suspense
            fallback={
              <div className="mt-[4.5rem] grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((item, i) => (
                  <CatalogCard key={item.id} item={item} index={i} />
                ))}
              </div>
            }
          >
            <CatalogBrowser items={catalog} categories={categories} />
          </Suspense>
        </div>
      </section>
      <QuoteCta contact={contact} />
    </>
  );
}

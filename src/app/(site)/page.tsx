import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  FeaturedProducts,
  GalleryTeaser,
  ProcessSection,
  QuoteCta,
  ServicesShowcase,
  TeamSection,
  TestimonialsSection,
} from "@/components/home/sections";
import { OfferStrip } from "@/components/site/offer-strip";
import { getActiveOffers, getCatalog, getMedia, getSiteContent, getTeam } from "@/lib/data";

export default async function HomePage() {
  const [content, offers, catalog, media, team] = await Promise.all([
    getSiteContent(),
    getActiveOffers(),
    getCatalog(),
    getMedia(),
    getTeam(),
  ]);
  const services = catalog.filter((c) => c.kind === "service");
  const products = catalog.filter((c) => c.kind === "product");
  const { contact } = content;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: contact.businessName,
    description: content.hero.subtitle,
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: { "@type": "PostalAddress", streetAddress: contact.address, addressLocality: "Ulhasnagar", addressRegion: "Maharashtra", addressCountry: "IN" },
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/logo.png`,
    sameAs: [contact.instagram, contact.facebook, contact.youtube].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero hero={content.hero} />
      <OfferStrip offers={offers} />
      <ServicesShowcase services={services} />
      <FeaturedProducts products={products} />
      <AboutSection about={content.about} />
      <ProcessSection />
      <GalleryTeaser media={media} />
      <TestimonialsSection items={content.testimonials.items} />
      <TeamSection team={team} />
      <QuoteCta contact={contact} />
    </>
  );
}

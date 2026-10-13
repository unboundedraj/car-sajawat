import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { MapEmbed } from "@/components/site/footer";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { getSiteContent } from "@/lib/data";
import { formatPhone, mapDirectionsUrl, telLink } from "@/lib/utils";
import { PaymentCard } from "@/components/site/payment-card";
import { PhoneCopyCard } from "@/components/site/phone-copy-card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit, call or WhatsApp Car Sajawat in Ulhasnagar for PPF, ceramic coating, accessories and modifications.",
};

export default async function ContactPage() {
  const { contact, payment } = await getSiteContent();
  const hours = contact.hours.filter((h) => h.days.trim() || h.time.trim());

  const cards = [
    {
      Icon: Phone,
      label: "Phone",
      value: formatPhone(contact.whatsapp),
      href: "", // copied on click, see PhoneCopyCard
      hint: "Fastest way to book an appointment / get a quote",
    },
    { Icon: Phone, label: "Call", value: contact.phone, href: telLink(contact.phone), hint: contact.altPhone || "Talk to our team" },
    { Icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, hint: "For detailed enquiries" },
    {
      Icon: MapPin,
      label: "Visit",
      value: contact.address,
      href: mapDirectionsUrl(contact.mapQuery || contact.address),
      hint: "Get directions",
    },
  ].filter((c) => c.value);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk <span className="text-accent">cars</span>
          </>
        }
        description="Drop by the studio, call, or send us your car model on WhatsApp. We'll suggest the right options for your budget."
        watermark="Hello"
      />

      <section className="py-16 sm:py-20">
        <div className="container-x">
          <div className={`grid gap-4 sm:grid-cols-2 ${cards.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
            {cards.map(({ Icon, label, value, href, hint }, i) => {
              const cardClass = "group card flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60";
              const inner = (
                <>
                  <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
                  <p className="mt-1 font-semibold break-words">{value}</p>
                  <p className="mt-auto pt-3 text-xs text-muted">{hint}</p>
                </>
              );
              return (
                <Reveal key={label} delay={i * 0.06}>
                  {label === "Phone" ? (
                    <PhoneCopyCard number={value} hint={hint} className={cardClass} />
                  ) : (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={cardClass}
                    >
                      {inner}
                    </a>
                  )}
                </Reveal>
              );
            })}
          </div>

          {payment.enabled && (payment.qrImage || payment.upiId) && (
            <Reveal>
              <PaymentCard payment={payment} businessName={contact.businessName} whatsapp={contact.whatsapp} />
            </Reveal>
          )}

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <EnquiryForm />
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-6 lg:col-span-2">
              {hours.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h2 className="display flex items-center gap-2 text-2xl font-bold">
                  <Clock className="size-5 text-accent" /> Opening hours
                </h2>
                <dl className="mt-5 divide-y divide-line">
                  {hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="font-medium">{h.days}</dt>
                      <dd className="text-right text-muted">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              )}
              <div className="relative min-h-80 flex-1 overflow-hidden rounded-2xl border border-line">
                <MapEmbed contact={contact} className="absolute inset-0 size-full dark:invert-[0.9] dark:hue-rotate-180" />
                <a
                  href={mapDirectionsUrl(contact.mapQuery || contact.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg shadow-lg"
                >
                  <Navigation className="size-4" /> Get directions
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

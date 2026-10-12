"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Save, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveContent } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { SiteContent, SiteContentKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminCard, IconButton, MediaField, Select, StringList, TextArea, TextInput, Toggle } from "./fields";

const TABS: { key: SiteContentKey; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact & map" },
  { key: "chatbot", label: "AI chatbot" },
  { key: "testimonials", label: "Testimonials" },
];

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [tab, setTab] = useState<SiteContentKey>("hero");
  const [content, setContent] = useState(initial);
  const [dirty, setDirty] = useState<Partial<Record<SiteContentKey, boolean>>>({});
  const [pending, startTransition] = useTransition();

  function update<K extends SiteContentKey>(key: K, patch: Partial<SiteContent[K]>) {
    setContent((c) => ({ ...c, [key]: { ...c[key], ...patch } }));
    setDirty((d) => ({ ...d, [key]: true }));
  }

  function save() {
    startTransition(async () => {
      const res = await saveContent(tab, content[tab]);
      if (res.ok) {
        toast.success("Saved. The website is updated.");
        setDirty((d) => ({ ...d, [tab]: false }));
      } else toast.error(res.error);
    });
  }

  const { hero, about, contact, chatbot, testimonials } = content;

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 mb-6 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {t.label}
              {dirty[t.key] && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber" aria-label="unsaved" />}
            </button>
          ))}
        </div>
        <Button onClick={save} disabled={pending || !dirty[tab]} size="sm">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </Button>
      </div>

      <div className="max-w-3xl space-y-6">
        {tab === "hero" && (
          <>
            <AdminCard title="Headline" description="The first thing visitors see.">
              <TextInput label="Eyebrow" value={hero.eyebrow} onChange={(v) => update("hero", { eyebrow: v })} />
              <TextInput label="Title" value={hero.title} onChange={(v) => update("hero", { title: v })} />
              <TextInput
                label="Highlighted words"
                hint="Part of the title shown in red, e.g. “turn heads”"
                value={hero.highlight}
                onChange={(v) => update("hero", { highlight: v })}
              />
              <TextArea label="Subtitle" rows={3} value={hero.subtitle} onChange={(v) => update("hero", { subtitle: v })} />
            </AdminCard>
            <AdminCard title="Buttons">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Primary label" value={hero.primaryCta.label} onChange={(v) => update("hero", { primaryCta: { ...hero.primaryCta, label: v } })} />
                <TextInput label="Primary link" value={hero.primaryCta.href} onChange={(v) => update("hero", { primaryCta: { ...hero.primaryCta, href: v } })} />
                <TextInput label="Secondary label" value={hero.secondaryCta.label} onChange={(v) => update("hero", { secondaryCta: { ...hero.secondaryCta, label: v } })} />
                <TextInput label="Secondary link" value={hero.secondaryCta.href} onChange={(v) => update("hero", { secondaryCta: { ...hero.secondaryCta, href: v } })} />
              </div>
            </AdminCard>
            <AdminCard title="Background media" description="A looping muted video (MP4, under 10 MB is best) or a wide photo. Leave empty for the animated studio backdrop.">
              <Select
                label="Type"
                value={hero.mediaType}
                onChange={(v) => update("hero", { mediaType: v, mediaUrl: v === hero.mediaType ? hero.mediaUrl : "" })}
                options={[
                  { value: "none", label: "Animated backdrop (no media)" },
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video (MP4/WebM)" },
                ]}
              />
              {hero.mediaType !== "none" && (
                <MediaField
                  label={hero.mediaType === "video" ? "Video" : "Image"}
                  accept={hero.mediaType === "video" ? "video" : "image"}
                  folder="hero"
                  value={hero.mediaUrl}
                  onChange={(v) => update("hero", { mediaUrl: v })}
                />
              )}
            </AdminCard>
            <AdminCard title="Stats" description="Up to 4 quick numbers under the buttons.">
              {hero.stats.map((s, i) => (
                <div key={i} className="flex items-end gap-2">
                  <TextInput label="Value" className="w-28" value={s.value} onChange={(v) => update("hero", { stats: hero.stats.map((x, j) => (j === i ? { ...x, value: v } : x)) })} />
                  <TextInput label="Label" className="flex-1" value={s.label} onChange={(v) => update("hero", { stats: hero.stats.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                  <IconButton label="Remove stat" tone="danger" onClick={() => update("hero", { stats: hero.stats.filter((_, j) => j !== i) })}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              ))}
              {hero.stats.length < 4 && (
                <button type="button" onClick={() => update("hero", { stats: [...hero.stats, { value: "", label: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  <Plus className="size-4" /> Add stat
                </button>
              )}
            </AdminCard>
          </>
        )}

        {tab === "about" && (
          <AdminCard title="About section">
            <TextInput label="Eyebrow" value={about.eyebrow} onChange={(v) => update("about", { eyebrow: v })} />
            <TextInput label="Title" value={about.title} onChange={(v) => update("about", { title: v })} />
            <TextArea label="Body" hint="Leave a blank line between paragraphs." rows={8} value={about.body} onChange={(v) => update("about", { body: v })} />
            <MediaField label="Photo" folder="about" value={about.image} onChange={(v) => update("about", { image: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Badge value" value={about.badgeValue} onChange={(v) => update("about", { badgeValue: v })} placeholder="10+" />
              <TextInput label="Badge label" value={about.badgeLabel} onChange={(v) => update("about", { badgeLabel: v })} placeholder="Years of craft" />
            </div>
            <StringList label="Highlights" max={8} values={about.highlights} onChange={(v) => update("about", { highlights: v })} />
          </AdminCard>
        )}

        {tab === "contact" && (
          <>
            <AdminCard title="Business details" description="Used in the navbar, footer, contact page, WhatsApp button and chatbot.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Business name" value={contact.businessName} onChange={(v) => update("contact", { businessName: v })} />
                <TextInput label="Tagline" value={contact.tagline} onChange={(v) => update("contact", { tagline: v })} />
                <TextInput label="Phone" value={contact.phone} onChange={(v) => update("contact", { phone: v })} />
                <TextInput label="Alternate phone" value={contact.altPhone} onChange={(v) => update("contact", { altPhone: v })} />
                <TextInput
                  label="WhatsApp number"
                  hint="Digits only with country code, e.g. 919876543210"
                  inputMode="numeric"
                  value={contact.whatsapp}
                  onChange={(v) => update("contact", { whatsapp: v.replace(/\D/g, "") })}
                />
                <TextInput label="Email" type="email" value={contact.email} onChange={(v) => update("contact", { email: v })} />
              </div>
              <TextArea
                label="WhatsApp pre-filled message"
                rows={7}
                hint="What visitors see when they tap a WhatsApp button, ready to fill in and send. New lines are kept; *text* is bold in WhatsApp."
                value={contact.whatsappMessage}
                onChange={(v) => update("contact", { whatsappMessage: v })}
              />
            </AdminCard>
            <AdminCard title="Location & map">
              <TextArea label="Address" rows={2} value={contact.address} onChange={(v) => update("contact", { address: v })} />
              <TextArea
                label="Google Maps embed"
                rows={3}
                hint="On Google Maps open your business → Share → Embed a map → Copy HTML, and paste it here (the whole <iframe> is fine)."
                value={contact.mapEmbedUrl}
                onChange={(v) => update("contact", { mapEmbedUrl: v.match(/src="([^"]+)"/)?.[1] ?? v.trim() })}
                placeholder="https://www.google.com/maps/embed?pb=…"
              />
              <TextInput
                label="Directions search"
                hint="Used by the “Directions” button (and as the map if no embed is set): the business name as listed on Google Maps works best."
                value={contact.mapQuery}
                onChange={(v) => update("contact", { mapQuery: v })}
              />
            </AdminCard>
            <AdminCard title="Opening hours">
              {contact.hours.map((h, i) => (
                <div key={i} className="flex items-end gap-2">
                  <TextInput label="Days" className="flex-1" value={h.days} onChange={(v) => update("contact", { hours: contact.hours.map((x, j) => (j === i ? { ...x, days: v } : x)) })} />
                  <TextInput label="Time" className="flex-1" value={h.time} onChange={(v) => update("contact", { hours: contact.hours.map((x, j) => (j === i ? { ...x, time: v } : x)) })} />
                  <IconButton label="Remove" tone="danger" onClick={() => update("contact", { hours: contact.hours.filter((_, j) => j !== i) })}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              ))}
              {contact.hours.length < 7 && (
                <button type="button" onClick={() => update("contact", { hours: [...contact.hours, { days: "", time: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  <Plus className="size-4" /> Add row
                </button>
              )}
            </AdminCard>
            <AdminCard title="Social links">
              <TextInput label="Instagram URL" value={contact.instagram} onChange={(v) => update("contact", { instagram: v })} placeholder="https://instagram.com/…" />
              <TextInput label="Facebook URL" value={contact.facebook} onChange={(v) => update("contact", { facebook: v })} placeholder="https://facebook.com/…" />
              <TextInput label="YouTube URL" value={contact.youtube} onChange={(v) => update("contact", { youtube: v })} placeholder="https://youtube.com/@…" />
            </AdminCard>
          </>
        )}

        {tab === "chatbot" && (
          <AdminCard
            title="AI assistant"
            description="Powered by Google Gemini. It already knows your services, products, offers, hours and contact details. Add anything else below."
          >
            <Toggle label="Show chatbot on website" checked={chatbot.enabled} onChange={(v) => update("chatbot", { enabled: v })} />
            <TextInput label="Assistant name" value={chatbot.assistantName} onChange={(v) => update("chatbot", { assistantName: v })} />
            <TextArea label="Greeting" rows={2} value={chatbot.greeting} onChange={(v) => update("chatbot", { greeting: v })} />
            <StringList label="Suggested questions" max={4} values={chatbot.suggestions} onChange={(v) => update("chatbot", { suggestions: v })} />
            <TextArea
              label="Extra knowledge"
              rows={12}
              hint="FAQs, price ranges you're happy to share, warranty terms, brands you use, booking policy, parking info… Plain text is fine."
              value={chatbot.knowledge}
              onChange={(v) => update("chatbot", { knowledge: v })}
              placeholder={"Q: How long does full-body PPF take?\nA: Usually 3–4 days depending on the car.\n\nWe use XYZ brand films with a 5-year warranty…"}
            />
          </AdminCard>
        )}

        {tab === "testimonials" && (
          <AdminCard title="Customer reviews" description="Shown on the landing page. The section is hidden while this is empty.">
            {testimonials.items.map((t, i) => {
              const set = (patch: Partial<typeof t>) =>
                update("testimonials", { items: testimonials.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
              return (
                <div key={i} className="space-y-3 rounded-xl border border-line p-4">
                  <div className="flex items-end gap-2">
                    <TextInput label="Name" className="flex-1" value={t.name} onChange={(v) => set({ name: v })} />
                    <TextInput label="Car" className="flex-1" value={t.vehicle} onChange={(v) => set({ vehicle: v })} />
                    <IconButton label="Remove review" tone="danger" onClick={() => update("testimonials", { items: testimonials.items.filter((_, j) => j !== i) })}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                  <TextArea label="Review" rows={3} value={t.quote} onChange={(v) => set({ quote: v })} />
                  <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={t.rating === n} aria-label={`${n} stars`} onClick={() => set({ rating: n })}>
                        <Star className={cn("size-5 text-amber", n <= t.rating ? "fill-current" : "opacity-30")} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => update("testimonials", { items: [...testimonials.items, { name: "", vehicle: "", quote: "", rating: 5 }] })}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              <Plus className="size-4" /> Add review
            </button>
          </AdminCard>
        )}
      </div>
    </div>
  );
}

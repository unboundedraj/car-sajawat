import { ChatWidget } from "@/components/chat/chat-widget";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { InstagramFab, WhatsAppFab } from "@/components/site/whatsapp-fab";
import { getCatalog, getCurrentYear, getSiteContent } from "@/lib/data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [{ contact, chatbot }, year, catalog] = await Promise.all([getSiteContent(), getCurrentYear(), getCatalog()]);
  // Featured services first, for the footer
  const footerServices = catalog
    .filter((c) => c.kind === "service")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .map(({ name, slug }) => ({ name, slug }));

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar
        businessName={contact.businessName}
        phone={contact.phone}
        whatsapp={contact.whatsapp}
        whatsappMessage={contact.whatsappMessage}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer contact={contact} year={year} services={footerServices} />
      {/* Floating stack, bottom → top: Instagram, WhatsApp, chat */}
      <InstagramFab url={contact.instagram} slot={0} />
      <WhatsAppFab number={contact.whatsapp} message={contact.whatsappMessage} slot={contact.instagram ? 1 : 0} />
      {chatbot.enabled && (
        <ChatWidget
          // Sits above WhatsApp (always shown) and Instagram (if set)
          slot={contact.instagram ? 2 : 1}
          assistantName={chatbot.assistantName}
          greeting={chatbot.greeting}
          suggestions={chatbot.suggestions}
          whatsapp={contact.whatsapp}
          whatsappMessage={contact.whatsappMessage}
        />
      )}
    </div>
  );
}

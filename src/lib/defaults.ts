// Fallback site content, shown until the admin saves each section in /admin.
// Only neutral copy and verified business details live here: no sample
// services/products/offers and no numbers or claims. The admin fills in the real data.
import type { SiteContent } from "./types";

export const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.2198882053444!2d73.15416880966835!3d19.229246347070855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7943fb4738115%3A0xbdd503b3992d5d3e!2sCAR%20SAJAWAT%20%5BThe%20Original%5D%20Best%20Car%20Accessories%20Car%20Decor%20in%20Ulhasnagar!5e0!3m2!1sen!2sus!4v1791802467610!5m2!1sen!2sus";

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    eyebrow: "House of Exclusive Car Accessories",
    title: "Built to turn heads",
    highlight: "turn heads",
    subtitle: "Paint protection, coatings, premium accessories and custom builds for your car.",
    primaryCta: { label: "Explore services", href: "/services" },
    secondaryCta: { label: "Contact us", href: "/contact" },
    mediaType: "none",
    mediaUrl: "",
    stats: [],
  },
  about: {
    eyebrow: "About us",
    title: "Where cars get their character",
    body: "Car Sajawat is a car accessories and modification studio. From daily drivers to weekend machines, we protect, upgrade and personalise vehicles.",
    image: "",
    badgeValue: "",
    badgeLabel: "",
    highlights: [],
  },
  contact: {
    businessName: "Car Sajawat",
    tagline: "House of Exclusive Car Accessories · Ulhasnagar",
    phone: "",
    altPhone: "",
    whatsapp: "",
    whatsappMessage: "Hi Car Sajawat! I'd like to know more about ",
    email: "carsajawatulhasnagar@gmail.com",
    address: "Ulhasnagar, Maharashtra, India",
    mapEmbedUrl: DEFAULT_MAP_EMBED,
    mapQuery: "CAR SAJAWAT [The Original] Best Car Accessories Car Decor in Ulhasnagar",
    hours: [],
    instagram: "https://www.instagram.com/carsajawat.ulhasnagar/",
    facebook: "",
    youtube: "",
  },
  chatbot: {
    enabled: true,
    assistantName: "Sajawat Assistant",
    greeting: "Hi! I'm the Car Sajawat assistant. Ask me about our services, accessories or how to reach us.",
    suggestions: ["PPF vs ceramic coating?", "Which accessories suit my car?", "How do I reach you?"],
    knowledge: "",
  },
  testimonials: { items: [] },
};

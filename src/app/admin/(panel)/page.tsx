import Link from "next/link";
import { ArrowUpRight, Bot, CheckCircle2, Database, Images, Inbox, Megaphone, Package, PenSquare, Users, XCircle } from "lucide-react";
import { AdminData, AdminPageHeader } from "@/components/admin/admin-page";
import { adminGetCatalog, adminGetEnquiries, adminGetMedia, adminGetOffers } from "@/lib/admin-data";
import { isAdminStorageConfigured, isSupabaseConfigured } from "@/lib/supabase";

const SECTIONS = [
  { href: "/admin/content", title: "Site content", text: "Hero banner, about, contact details, map, opening hours, social links, AI chatbot and reviews.", Icon: PenSquare },
  { href: "/admin/offers", title: "Offers strip", text: "Deals and announcements that scroll in the red strip under the hero.", Icon: Megaphone },
  { href: "/admin/catalog", title: "Services & products", text: "Categories, services and products with estimated costs, photos and videos.", Icon: Package },
  { href: "/admin/gallery", title: "Gallery", text: "Photos, videos and YouTube links for the /gallery page and home page.", Icon: Images },
  { href: "/admin/team", title: "Team", text: "Team members with photos and roles, shown in the Team section.", Icon: Users },
  { href: "/admin/enquiries", title: "Enquiries", text: "Callback requests from the contact form.", Icon: Inbox },
];

export default function AdminDashboard() {
  const checks = [
    { label: "Supabase database", ok: isSupabaseConfigured() && isAdminStorageConfigured(), Icon: Database },
    { label: "Gemini chatbot", ok: Boolean(process.env.GEMINI_API_KEY), Icon: Bot },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Manage everything on the Car Sajawat website from here." />
      <div className="grid gap-4 sm:grid-cols-2">
        {checks.map(({ label, ok, Icon }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-surface-2">
              <Icon className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className={`text-xs ${ok ? "text-emerald-500" : "text-amber"}`}>{ok ? "Connected" : "Not configured"}</p>
            </div>
            {ok ? <CheckCircle2 className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-amber" />}
          </div>
        ))}
      </div>
      <h2 className="mt-10 mb-4 font-display text-xl font-semibold uppercase tracking-wide">Manage your website</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map(({ href, title, text, Icon }) => (
          <Link key={href} href={href} className="group card relative flex gap-4 p-5 transition-colors hover:border-accent/60">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="mt-1 block text-sm text-muted">{text}</span>
            </span>
            <ArrowUpRight className="absolute top-5 right-5 size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold uppercase tracking-wide">At a glance</h2>
      <div>
        <AdminData>
          <Stats />
        </AdminData>
      </div>
    </>
  );
}

async function Stats() {
  const [catalog, media, offers, enquiries] = await Promise.all([adminGetCatalog(), adminGetMedia(), adminGetOffers(), adminGetEnquiries()]);
  const tiles = [
    { href: "/admin/catalog", label: "Services", value: catalog.filter((c) => c.kind === "service").length, Icon: Package },
    { href: "/admin/catalog", label: "Products", value: catalog.filter((c) => c.kind === "product").length, Icon: Package },
    { href: "/admin/gallery", label: "Gallery items", value: media.length, Icon: Images },
    { href: "/admin/offers", label: "Active offers", value: offers.filter((o) => o.is_active).length, Icon: Megaphone },
    { href: "/admin/enquiries", label: "New enquiries", value: enquiries.filter((e) => e.status === "new").length, Icon: Inbox, hot: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {tiles.map(({ href, label, value, Icon, hot }) => (
        <Link key={label} href={href} className="group card relative overflow-hidden p-5 transition-colors hover:border-accent/60">
          <Icon className="size-5 text-muted" />
          <p className={`display mt-6 text-5xl font-bold ${hot && value > 0 ? "text-accent" : ""}`}>{value}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
          <ArrowUpRight className="absolute top-5 right-5 size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Images, Inbox, LayoutDashboard, LogOut, Megaphone, Menu, Package, PenSquare, Users, X } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/content", label: "Site content", Icon: PenSquare },
  { href: "/admin/offers", label: "Offers strip", Icon: Megaphone },
  { href: "/admin/catalog", label: "Services & products", Icon: Package },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/team", label: "Team", Icon: Users },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-fg">
          <ExternalLink className="size-4" /> View website
        </a>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-accent/10 hover:text-accent">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="grid size-10 place-items-center rounded-xl border border-line">
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 border-r border-line bg-bg-elevated p-4">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-9 place-items-center rounded-lg border border-line">
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-line bg-bg-elevated p-5 lg:flex">
        <Link href="/admin">
          <Logo />
          <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Admin panel</span>
        </Link>
        {nav}
      </aside>
    </>
  );
}

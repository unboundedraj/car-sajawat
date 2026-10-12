-- Car Sajawat — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor. All content is then added from /admin.
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Editable landing-page content (hero, about, contact, chatbot…)
-- One row per section, value is JSON shaped like SiteContent[key].
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Offers/deals shown in the CTA strip under the hero
create table if not exists public.offers (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  badge       text,
  link_url    text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Admin-managed categories, separate lists for services and products
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('service', 'product')),
  name         text not null,
  slug         text not null,
  description  text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  unique (kind, slug)
);

-- Services (PPF, ceramic…) and products (accessories) share one table
create table if not exists public.catalog_items (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('service', 'product')),
  name         text not null,
  slug         text not null unique,
  category_id  uuid references public.categories (id) on delete set null,
  tagline      text,
  description  text,
  -- Estimated cost in whole rupees. from only = "₹X", from+to = "₹X – ₹Y"
  price_from   integer check (price_from >= 0),
  price_to     integer check (price_to >= 0),
  price_note   text,
  cover_image  text,
  images       text[] not null default '{}',
  videos       text[] not null default '{}',
  features     text[] not null default '{}',
  is_featured  boolean not null default false,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists catalog_items_kind_idx on public.catalog_items (kind, sort_order);

-- Upgrade path for databases created with the first version of this file
-- (free-text category + price_label). No-op on fresh installs.
alter table public.catalog_items add column if not exists category_id uuid references public.categories (id) on delete set null;
alter table public.catalog_items add column if not exists price_from integer check (price_from >= 0);
alter table public.catalog_items add column if not exists price_to integer check (price_to >= 0);
alter table public.catalog_items add column if not exists price_note text;
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'catalog_items' and column_name = 'category') then
    insert into public.categories (kind, name, slug)
      select distinct kind, category, trim(both '-' from lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')))
      from public.catalog_items
      on conflict (kind, slug) do nothing;
    update public.catalog_items ci set category_id = c.id
      from public.categories c
      where ci.category_id is null and c.kind = ci.kind and c.name = ci.category;
    alter table public.catalog_items drop column category;
  end if;
end $$;
alter table public.catalog_items drop column if exists price_label;

-- Gallery / assets page
create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('image', 'video', 'youtube')),
  url          text not null,
  title        text,
  category     text not null default 'General',
  is_featured  boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  bio         text,
  photo_url   text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Contact-form submissions (written server-side only)
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  vehicle     text,
  interest    text,
  message     text,
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- The public (publishable/anon key) can only READ visible rows.
-- All writes go through the Next.js server using the secret key,
-- which bypasses RLS, after the admin password check.
-- ─────────────────────────────────────────────────────────────
alter table public.site_content  enable row level security;
alter table public.offers        enable row level security;
alter table public.categories    enable row level security;
alter table public.catalog_items enable row level security;
alter table public.media_assets  enable row level security;
alter table public.team_members  enable row level security;
alter table public.enquiries     enable row level security;

drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content for select using (true);

drop policy if exists "public read active offers" on public.offers;
create policy "public read active offers" on public.offers for select using (is_active);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

drop policy if exists "public read active catalog" on public.catalog_items;
create policy "public read active catalog" on public.catalog_items for select using (is_active);

drop policy if exists "public read media" on public.media_assets;
create policy "public read media" on public.media_assets for select using (true);

drop policy if exists "public read active team" on public.team_members;
create policy "public read active team" on public.team_members for select using (is_active);
-- enquiries: no public policies → not readable/writable with the publishable key.

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for uploaded images & videos (public read).
-- Uploads use short-lived signed upload URLs minted by the server,
-- so no insert policy is needed for the public role.
-- 50 MB per file is the free-tier maximum.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

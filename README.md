# Car Sajawat — website

Marketing site and admin panel for **Car Sajawat**, a car accessories & modifications studio in Mumbai.

**Stack:** Next.js 16 (App Router, Cache Components) · Tailwind CSS v4 · Motion · Supabase (Postgres + Storage) · Google Gemini · TypeScript

## Features

- **Landing page** with an animated hero (admin-set image/video or a CSS "studio" backdrop), an offers marquee directly under the hero, a services bento grid, featured products, about, process, gallery teaser, testimonials, team and a quote CTA
- **Routes:** `/` · `/services` (services and products tabs with category filters) · `/services/[slug]` · `/gallery` (photos, videos and YouTube, with a lightbox) · `/contact` (enquiry form and map) · `/admin`
- **Light / dark / system theme** with no flash on load (dark by default; change `DEFAULT_THEME` in `src/components/theme/theme-config.ts`)
- **Responsive** layouts for mobile, tablet and desktop
- **Floating WhatsApp and Instagram buttons** (WhatsApp opens with a pre-filled message), plus an "Enquire on WhatsApp" button on every service/product page
- **Estimated costs** (₹ from / to, plus a note like "onwards") on every service and product, so customers see a price range before calling
- **Downloadable PDF catalogue** (`/catalog.pdf`, linked from the navbar): every service and product grouped by category, with descriptions, features and estimated prices. Contact details appear at the end and in every page footer. It's generated live from the database, so it's always current.
- **Page-transition animation**: a spinning alloy wheel (with a fixed red brake caliper) between page navigations
- **Gemini AI chatbot** grounded in live site data (services, products, prices, offers, hours, contact) plus free-text "extra knowledge" from the admin
- **Google Maps** embed in the footer and on the contact page
- **Admin panel** (`/admin`, protected by a password in an env var) to edit:
  - hero, about, contact details, map location, opening hours, socials
  - the offers strip
  - **categories** for services and products (create, rename, describe, reorder, delete)
  - services and products in those categories (estimated cost, cover image, photo gallery, videos, features)
  - gallery media, team, testimonials and chatbot settings
  - enquiries from the contact form (with status tracking)

Pages are pre-rendered and cached. When the admin saves something, only the affected data is invalidated (`updateTag`), so the site stays fast and updates show up immediately.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev                  # http://localhost:3000
```

There is no sample data. Until Supabase is connected and the admin adds content, the site shows neutral fallback text (from `src/lib/defaults.ts`) and empty states for services, products, offers and the gallery. Without a Gemini key, the chatbot replies with a "message us on WhatsApp" fallback.

### 1. Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the tables, row-level security policies and a public `media` storage bucket.
3. From **Project Settings → API**, copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable / anon key)
   - `SUPABASE_SECRET_KEY` (secret / service_role key, **server only**)

### 2. Admin access

Set `ADMIN_PASSWORD` and an `ADMIN_SESSION_SECRET` of at least 32 random characters:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then sign in at `/admin`. Sessions last 7 days. Changing the password signs every session out.

### 3. Gemini chatbot

Create a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-flash-latest`. The route has a simple per-IP rate limit and caps message length and history.

### 4. Google Maps

The map uses the studio's own Google Maps embed (no API key needed). To change it, open the business on Google Maps → **Share → Embed a map → Copy HTML**, and paste it into **Admin → Site content → Contact & map → Google Maps embed**. The whole `<iframe>` is fine; the link is extracted automatically. The **Directions search** field drives the "Directions" buttons.

## Images & videos: hosting options

| Option | Good for | Free tier | Notes |
|---|---|---|---|
| **Supabase Storage** *(implemented)* | Photos, short clips | 1 GB storage, 5 GB egress / month, 50 MB per file | Uploads go straight from the browser via signed URLs; images are optimised by `next/image` |
| **YouTube (unlisted or public)** *(implemented)* | Long videos, walkarounds, reels | Unlimited | Paste the link anywhere a video is accepted; uses privacy-enhanced embeds |
| Cloudinary | Heavy video use, automatic transcoding | ~25 credits / month | Swap `uploadFile()` in `src/components/admin/upload.ts` |
| Cloudflare R2 / Stream | High traffic | R2: 10 GB, no egress fees | S3-compatible; Stream is paid |

**Tips:** compress photos before uploading (a WebP around 2000px wide is plenty). Keep the hero video under about 10 MB (a 10–15 s muted loop, 1080p, H.264). Use YouTube for anything longer.

## Project structure

```
src/
  app/
    (site)/            public pages + shared navbar/footer/chat layout
    admin/
      login/           password login
      (panel)/         dashboard, content, offers, catalog, gallery, team, enquiries
      actions.ts       all admin Server Actions (each re-checks the session)
    api/chat/          Gemini streaming endpoint
  components/          home sections, catalog, gallery, chat, admin UI, theme
  lib/
    data.ts            cached public data access ('use cache' + tags)
    admin-data.ts      uncached admin reads
    chat-context.ts    builds the chatbot's system prompt from live data
    defaults.ts        fallback text shown until each section is saved in /admin
    catalog-pdf.tsx    the PDF catalogue (react-pdf, brand fonts in /assets/fonts)
    price.ts           ₹ formatting for estimated costs
    schemas.ts         zod validation for every admin input
  proxy.ts             redirects /admin/* to the login page when signed out
supabase/schema.sql    database, RLS and storage setup
```

## Before launch checklist

- [ ] Fill in from the admin panel: phone, WhatsApp, email, hours, hero text and stats, about text, offers, categories, services and products
- [ ] Add an estimated cost to every service and product (each shows "Price on request" until one is set)
- [ ] Check every claim is accurate: hero stats, the "years of craft" badge, and about highlights such as "certified installers"
- [ ] Upload real photos (hero, about, services, gallery, team)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] Use a strong `ADMIN_PASSWORD`
- [ ] Add testimonials only from genuine customer reviews

## Deploying

Deploy to [Vercel](https://vercel.com) (or any Node host): import the repo, add the env vars from `.env.example`, and deploy.

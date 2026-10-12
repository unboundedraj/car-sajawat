import type { Metadata, Viewport } from "next";
import { Manrope, Oswald, Syncopate } from "next/font/google";
import { themeScript } from "@/components/theme/theme-config";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { MotionProvider } from "@/components/motion-provider";
import { RouteWheel } from "@/components/site/route-wheel";
import { Toaster } from "@/components/theme/toaster";
import "./globals.css";

const display = Oswald({
  variable: "--font-display-face",
  subsets: ["latin"],
});

// Wide display face used only for the "CAR SAJAWAT" wordmark
const brand = Syncopate({
  variable: "--font-brand-face",
  subsets: ["latin"],
  weight: "700",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND_NAME} | ${BRAND_TAGLINE}, Ulhasnagar`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Car Sajawat, the House of Exclusive Car Accessories in Ulhasnagar: premium car accessories, lighting, interiors, paint protection film (PPF), ceramic coating and custom modifications.",
  keywords: [
    "car accessories Ulhasnagar",
    "exclusive car accessories",
    "car accessories Mumbai",
    "PPF Mumbai",
    "ceramic coating Mumbai",
    "car modification Mumbai",
    "car wrap Mumbai",
    "Car Sajawat",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Car Sajawat",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05080f" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${body.variable} ${brand.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          {children}
          <RouteWheel />
        </MotionProvider>
        <Toaster />
      </body>
    </html>
  );
}

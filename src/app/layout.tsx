import type { Metadata, Viewport } from "next";
import { Manrope, Oswald } from "next/font/google";
import { themeScript } from "@/components/theme/theme-config";
import { MotionProvider } from "@/components/motion-provider";
import { RouteWheel } from "@/components/site/route-wheel";
import { Toaster } from "@/components/theme/toaster";
import "./globals.css";

const display = Oswald({
  variable: "--font-display-face",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Car Sajawat | Car Accessories & Modifications in Mumbai",
    template: "%s | Car Sajawat",
  },
  description:
    "Car Sajawat is a Mumbai car styling studio for paint protection film (PPF), ceramic coating, wraps, interiors, lighting and premium car accessories.",
  keywords: [
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
      className={`${display.variable} ${body.variable} dark h-full antialiased`}
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

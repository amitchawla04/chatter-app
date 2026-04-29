import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n-server";
import { I18nProvider } from "@/components/I18nProvider";
import enDict from "@/messages/en.json";
import esDict from "@/messages/es.json";
import ptDict from "@/messages/pt.json";
import hiDict from "@/messages/hi.json";
import frDict from "@/messages/fr.json";
import deDict from "@/messages/de.json";

const DICTS: Record<string, Record<string, string>> = {
  en: enDict,
  es: esDict,
  pt: ptDict,
  hi: hiDict,
  fr: frDict,
  de: deDict,
};

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3003");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Chatter — whispers from people who actually know",
  description:
    "The whisper network. Layer 1.5 of social — between public broadcasting and private messaging. No ads. No public counts. AI is opt-in. Your data stays yours.",
  openGraph: {
    title: "Chatter",
    description:
      "Whispers from people who actually know. Topic-organized. Identity-verified. No ads, ever.",
    type: "website",
    siteName: "Chatter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatter",
    description: "whispers from people who actually know.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chatter",
  },
  applicationName: "Chatter",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = DICTS[locale] ?? DICTS.en;
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        {/* Next.js auto-generates /icon and /apple-icon from app/icon.tsx + app/apple-icon.tsx */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Performance — preconnect to Supabase + Unsplash for faster API + image hits */}
        <link rel="preconnect" href="https://kpgsrntbmzdqvspcyekf.supabase.co" />
        <link rel="dns-prefetch" href="https://kpgsrntbmzdqvspcyekf.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-canvas text-ink font-body antialiased">
        <I18nProvider locale={locale} dict={dict} fallback={DICTS.en}>
          <a href="#main-content" className="skip-link">skip to content</a>
          <div id="main-content">{children}</div>
        </I18nProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { BottomNav } from "@/components/navigation/BottomNav";
import { TopNav } from "@/components/navigation/TopNav";
import { MobileTopBar } from "@/components/navigation/MobileTopBar";
import { LEAGUE_BRAND } from "@/lib/data/league-config";
import { getLeagueBundle } from "@/lib/espn/service";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import { phaseHeadline } from "@/lib/espn/derive";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${LEAGUE_BRAND.name} · ${LEAGUE_BRAND.season} Fantasy Football`,
    template: `%s · ${LEAGUE_BRAND.name}`,
  },
  description: LEAGUE_BRAND.blurb,
  applicationName: LEAGUE_BRAND.name,
  appleWebApp: {
    capable: true,
    title: LEAGUE_BRAND.name,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: `${LEAGUE_BRAND.name} · ${LEAGUE_BRAND.tagline}`,
    description: LEAGUE_BRAND.blurb,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
  ],
  width: "device-width",
  initialScale: 1,
  // Lets the app paint behind the notch and home indicator.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bundle = await getLeagueBundle();
  const statusLabel = bundle.meta ? phaseHeadline(bundle) : undefined;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      // Rendered with the default theme; the boot script below swaps it to the
      // visitor's saved choice before paint, which React must not flag.
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-on-accent"
        >
          Skip to content
        </a>

        <TopNav />
        <MobileTopBar statusLabel={statusLabel} />

        <main
          id="main"
          className="mx-auto w-full max-w-lg px-4 pb-[calc(5.5rem+var(--safe-bottom))] md:max-w-3xl md:px-6 md:pb-20"
        >
          {children}
        </main>

        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}

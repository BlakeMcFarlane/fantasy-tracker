import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { BottomNav } from "@/components/navigation/BottomNav";
import { TopNav } from "@/components/navigation/TopNav";
import { MobileTopBar } from "@/components/navigation/MobileTopBar";
import { LEAGUE_BRAND } from "@/lib/data/league-config";
import { getLeagueBundle } from "@/lib/espn/service";
import { phaseHeadline } from "@/lib/espn/derive";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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
  themeColor: "#0b0d11",
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
      className={`${display.variable} ${body.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-950"
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
      </body>
    </html>
  );
}

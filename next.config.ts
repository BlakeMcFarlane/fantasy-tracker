import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sits on top of the mobile nav bar.
  devIndicators: false,
  images: {
    remotePatterns: [
      // ESPN player headshots and NFL team logos.
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "a1.espncdn.com" },
      { protocol: "https", hostname: "g.espncdn.com" },
    ],
    formats: ["image/webp"],
  },
  // The ESPN package is CommonJS and must stay on the server (it holds cookies).
  serverExternalPackages: ["espn-fantasy-football-api"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

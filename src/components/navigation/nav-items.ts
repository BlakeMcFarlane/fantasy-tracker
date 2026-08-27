import { Home, Shield, Swords, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Also treat these path prefixes as "this tab is active". */
  matches?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/league", label: "League", icon: Shield },
  { href: "/matchups", label: "Matchups", icon: Swords },
  { href: "/standings", label: "Standings", icon: Trophy, matches: ["/team"] },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  return (item.matches ?? []).some((prefix) => pathname.startsWith(prefix));
}

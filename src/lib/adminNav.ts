import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  QrCode,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { UserRole } from "@prisma/client";

export type AdminNavVariant = "default" | "scanner";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: AdminNavVariant;
};

export type MobileNavItem = AdminNavItem & {
  highlight?: boolean;
  roles?: UserRole[];
};

export const ADMIN_ROOT_PATHS = new Set([
  "/admin/dashboard",
  "/admin/scanner",
  "/admin/players",
  "/admin/teams",
  "/admin/competitions",
  "/admin/profil",
]);

export const ADMIN_MAIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/competitions", label: "Compétitions", icon: Trophy },
  { href: "/admin/teams", label: "Équipes", icon: Shield },
  { href: "/admin/players", label: "Joueurs", icon: Users },
];

export const ADMIN_TOOLS_NAV: AdminNavItem[] = [
  { href: "/admin/profil", label: "Profil", icon: User, variant: "default" },
  { href: "/admin/scanner", label: "Scanner QR", icon: QrCode, variant: "scanner" },
];

export const ADMIN_MOBILE_NAV: MobileNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/competitions",
    label: "Compétitions",
    icon: Trophy,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  { href: "/admin/scanner", label: "Scanner", icon: QrCode, highlight: true },
  { href: "/admin/players", label: "Joueurs", icon: Users },
  { href: "/admin/teams", label: "Équipes", icon: Shield },
  { href: "/admin/profil", label: "Profil", icon: User },
];

export function getMobileNavItems(role: UserRole): MobileNavItem[] {
  const items = ADMIN_MOBILE_NAV.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  // Barre mobile : max 5 entrées (grille fixe)
  if (items.length <= 5) {
    return items;
  }

  return items.filter((item) => item.href !== "/admin/competitions");
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }

  if (
    href === "/admin/players" ||
    href === "/admin/teams" ||
    href === "/admin/competitions" ||
    href === "/admin/scanner" ||
    href === "/admin/profil"
  ) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/scanner")) return "Scanner QR";
  if (pathname === "/admin/players/cards") return "Cartes licences";
  if (pathname === "/admin/players/new") return "Ajouter un joueur";
  if (/^\/admin\/players\/[^/]+\/edit\/?$/.test(pathname)) return "Modifier le joueur";
  if (/^\/admin\/players\/[^/]+\/?$/.test(pathname)) return "Fiche joueur";
  if (pathname.startsWith("/admin/players")) return "Joueurs";
  if (pathname.startsWith("/admin/teams")) return "Équipes";
  if (pathname.startsWith("/admin/competitions")) return "Compétitions";
  if (pathname.startsWith("/admin/profil")) return "Profil";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  return "Administration";
}

export function getMobileTopbarBrand(pathname: string): {
  href: string;
  icon: LucideIcon;
  primary: string;
  accent?: string;
} {
  if (pathname.startsWith("/admin/scanner")) {
    return { href: "/admin/scanner", icon: QrCode, primary: "Scan ", accent: "QR" };
  }
  if (pathname.startsWith("/admin/players")) {
    return { href: "/admin/players", icon: Users, primary: "Joueurs" };
  }
  if (pathname.startsWith("/admin/teams")) {
    return { href: "/admin/teams", icon: Shield, primary: "Équipes" };
  }
  if (pathname.startsWith("/admin/competitions")) {
    return { href: "/admin/competitions", icon: Trophy, primary: "Compétitions" };
  }
  if (pathname.startsWith("/admin/profil")) {
    return { href: "/admin/profil", icon: User, primary: "Profil" };
  }
  return { href: "/admin/dashboard", icon: LayoutDashboard, primary: "Dashboard" };
}

export function canManageCompetition(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

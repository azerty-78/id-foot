"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ADMIN_ROOT_PATHS } from "@/lib/adminNav";
import { SCAN_ONLY_HOME } from "@/lib/auth/scanOnlyAccess";

export function useAdminBackPath(): string | null {
  const pathname = usePathname();
  const { data: session } = useSession();
  const scanOnly = session?.user?.scanOnly === true;

  if (scanOnly) {
    if (pathname === SCAN_ONLY_HOME || pathname.startsWith(`${SCAN_ONLY_HOME}/`)) {
      return null;
    }
    if (pathname.startsWith("/admin/profil")) {
      return SCAN_ONLY_HOME;
    }
    return SCAN_ONLY_HOME;
  }

  if (ADMIN_ROOT_PATHS.has(pathname)) {
    return null;
  }

  if (pathname === "/admin/players/cards") {
    return "/admin/players";
  }

  const playerEditMatch = pathname.match(/^\/admin\/players\/([^/]+)\/edit$/);
  if (playerEditMatch) {
    return `/admin/players/${playerEditMatch[1]}`;
  }

  if (pathname.startsWith("/admin/players/")) {
    return "/admin/players";
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 2) {
    return `/${segments.slice(0, -1).join("/")}`;
  }

  return "/admin/dashboard";
}

export { isNavItemActive } from "@/lib/adminNav";

export function isAdminRootPath(pathname: string): boolean {
  return ADMIN_ROOT_PATHS.has(pathname);
}

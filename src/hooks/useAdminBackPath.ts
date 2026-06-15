"use client";

import { usePathname } from "next/navigation";
import { ADMIN_ROOT_PATHS } from "@/lib/adminNav";

export function useAdminBackPath(): string | null {
  const pathname = usePathname();

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

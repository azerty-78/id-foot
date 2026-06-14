"use client";

import { usePathname } from "next/navigation";

const ROOT_PATHS = new Set([
  "/admin/dashboard",
  "/admin/scanner",
  "/admin/players",
  "/admin/teams",
  "/admin/competitions",
]);

export function useAdminBackPath(): string | null {
  const pathname = usePathname();

  if (ROOT_PATHS.has(pathname)) {
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

export function isAdminRootPath(pathname: string): boolean {
  return ROOT_PATHS.has(pathname);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }

  if (href === "/admin/players") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/admin/teams") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/admin/competitions") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/admin/scanner") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

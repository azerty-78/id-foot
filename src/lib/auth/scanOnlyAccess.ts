import type { AuthUser } from "@/lib/auth/scope";

export const SCAN_ONLY_HOME = "/admin/scanner";

const SCAN_ONLY_ADMIN_PREFIXES = [
  "/admin/scanner",
  "/admin/profil",
  "/admin/signout",
] as const;

const SCAN_ONLY_API_PREFIXES = ["/api/qr/", "/api/users/me", "/api/auth/"] as const;

export function isScanOnlyUser(
  user: Pick<AuthUser, "scanOnly"> | null | undefined,
): boolean {
  return user?.scanOnly === true;
}

export function isScanOnlyAdminPath(pathname: string): boolean {
  return SCAN_ONLY_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isScanOnlyApiPath(pathname: string): boolean {
  return SCAN_ONLY_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function resolvePostLoginPath(
  scanOnly: boolean,
  callbackUrl: string,
  fallback: string,
): string {
  if (scanOnly) {
    return SCAN_ONLY_HOME;
  }
  return callbackUrl || fallback;
}

/** Seuls les gestionnaires peuvent avoir scanOnly ; jamais un administrateur. */
export function normalizeScanOnlyForRole(
  role: "ADMIN" | "MANAGER" | "SUPER_ADMIN",
  scanOnly: boolean | undefined | null,
): boolean {
  if (role !== "MANAGER") {
    return false;
  }
  return scanOnly === true;
}

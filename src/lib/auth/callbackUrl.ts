import { ADMIN_COMPETITION_HOME } from "@/lib/competitionSlug";

/** Limite les redirections post-connexion aux chemins internes. */
export function resolveSafeCallbackUrl(
  callbackUrl: string | undefined | null,
  fallback = ADMIN_COMPETITION_HOME,
): string {
  const value = callbackUrl?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export function isQrScanCallbackUrl(callbackUrl: string | undefined): boolean {
  return Boolean(callbackUrl?.startsWith("/scan/"));
}

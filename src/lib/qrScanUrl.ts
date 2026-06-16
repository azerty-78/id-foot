import { getAppBaseUrl } from "@/lib/competitionSlug";

export function buildQrScanPath(token: string): string {
  return `/scan/${encodeURIComponent(token)}`;
}

export function buildQrScanUrl(token: string, baseUrl?: string): string {
  const base = (baseUrl ?? getAppBaseUrl()).replace(/\/$/, "");
  return `${base}${buildQrScanPath(token)}`;
}

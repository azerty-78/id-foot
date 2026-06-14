/** Chemins publics des assets de marque ID FOOT */
export const brandAssets = {
  /** Logo transparent — affichage in-app uniquement (sidebar, topbar, QR…) */
  logo: "/id-foot-nobg.png",
  qrLogo: "/id-foot-nobg.png",
  /** Favicon / PWA — assets dédiés dans /brand/ */
  icon: "/brand/icon.png",
  appleTouchIcon: "/brand/apple-touch-icon.png",
  icon192: "/brand/icon-192.png",
  icon512: "/brand/icon-512.png",
} as const;

/** URL absolue pour les contextes qui exigent un chemin complet (QR SVG, e-mail…). */
export function getBrandAssetUrl(path: string, baseUrl?: string): string {
  const base =
    baseUrl?.replace(/\/$/, "") ??
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
        process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
        "");

  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

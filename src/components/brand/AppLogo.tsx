import Link from "next/link";
import { brandAssets } from "@/lib/brand";

type AppLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Remplace le logo ID FOOT (ex. image de la compétition). */
  src?: string | null;
  alt?: string;
};

const sizes = {
  sm: 42,
  md: 54,
  lg: 72,
  xl: 88,
};

/**
 * Logo transparent servi en statique direct (/id-foot-nobg.png) — pas via /_next/image,
 * pour garantir l'affichage en dev, Docker standalone et derrière Nginx.
 */
export function AppLogo({
  href,
  size = "md",
  className = "",
  src,
  alt = "ID FOOT",
}: AppLogoProps) {
  const dim = sizes[size];
  const logoSrc = src?.trim() || brandAssets.logo;
  const isCompetitionLogo = Boolean(src?.trim());

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt={alt}
      width={dim}
      height={dim}
      decoding="async"
      loading="eager"
      className={`block shrink-0 object-contain ${isCompetitionLogo ? "app-logo--competition" : ""} ${className}`}
      style={{ width: dim, height: dim }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return image;
}

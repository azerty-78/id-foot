import { brandAssets } from "@/lib/brand";

/**
 * Le logo au centre du QR est décoratif uniquement.
 * Le scanner valide le joueur via le `qrToken` encodé dans l'URL — jamais via le logo.
 * Un changement de logo (ID FOOT → compétition, ou ancien → nouveau) n'invalide donc
 * aucune carte déjà imprimée.
 */
export function resolveQrLogoSrc(
  competitionImage: string | null | undefined,
): string {
  const custom = competitionImage?.trim();
  return custom || brandAssets.qrLogo;
}

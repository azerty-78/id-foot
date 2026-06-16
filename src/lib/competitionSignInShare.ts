import type { Metadata } from "next";
import { brandAssets, getBrandAssetUrl } from "@/lib/brand";
import {
  buildCompetitionSignInAbsoluteUrl,
  getAppBaseUrl,
} from "@/lib/competitionSlug";

export type CompetitionSignInPreview = {
  nom: string;
  abbreviation: string;
  slug: string;
  annee: number;
  lieu: string | null;
  image: string | null;
};

export function resolveShareImageUrl(
  image: string | null | undefined,
  baseUrl: string,
): string {
  if (image) {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return getBrandAssetUrl(image, baseUrl);
  }

  return getBrandAssetUrl(brandAssets.logo, baseUrl);
}

export function buildCompetitionSignInTitle(nom: string): string {
  return `Se connecter pour gérer ${nom}`;
}

export function buildCompetitionSignInDescription(
  competition: CompetitionSignInPreview,
): string {
  const place =
    competition.lieu != null && competition.lieu.length > 0
      ? `${competition.lieu}, ${competition.annee}`
      : String(competition.annee);

  return `Connectez-vous pour administrer la compétition ${competition.nom} (${place}) via ${competition.abbreviation}.`;
}

export function buildCompetitionSignInMetadata(
  competition: CompetitionSignInPreview | null,
  baseUrl = getAppBaseUrl(),
): Metadata {
  if (!competition) {
    const title = "Connexion — ID FOOT";
    const description =
      "Connectez-vous à l'espace d'administration ID FOOT pour gérer vos compétitions.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        siteName: "ID FOOT",
        type: "website",
        images: [
          {
            url: getBrandAssetUrl(brandAssets.logo, baseUrl),
            alt: "ID FOOT",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [getBrandAssetUrl(brandAssets.logo, baseUrl)],
      },
    };
  }

  const title = buildCompetitionSignInTitle(competition.nom);
  const description = buildCompetitionSignInDescription(competition);
  const url = buildCompetitionSignInAbsoluteUrl(competition.slug, baseUrl);
  const imageUrl = resolveShareImageUrl(competition.image, baseUrl);

  return {
    title: `${title} | ${competition.abbreviation}`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: competition.abbreviation,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: competition.nom,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

type ShareToast = (tone: "success" | "error", message: string) => void;

export function buildCompetitionSignInShareText(
  competition: Pick<CompetitionSignInPreview, "nom" | "abbreviation">,
): string {
  return `Connectez-vous pour administrer la compétition ${competition.nom} via ${competition.abbreviation}.`;
}

export async function shareCompetitionSignInLink(
  competition: Pick<CompetitionSignInPreview, "nom" | "slug" | "abbreviation">,
  showToast: ShareToast,
): Promise<void> {
  const url = buildCompetitionSignInAbsoluteUrl(competition.slug);
  const title = buildCompetitionSignInTitle(competition.nom);
  const text = buildCompetitionSignInShareText(competition);

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("success", "Lien de connexion copié dans le presse-papiers.");
      return;
    }

    showToast("error", "Le partage n'est pas disponible sur cet appareil.");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    showToast("error", "Impossible de partager le lien pour le moment.");
  }
}

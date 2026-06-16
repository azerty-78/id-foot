import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import {
  loadPlayerPhotoBuffer,
  renderPlayerCardPng,
} from "@/lib/playerCardRender";
import type { CardRenderPlayer } from "@/lib/playerCardSvg";
import { buildPlayerListWhere } from "@/lib/playerFilters";
import { generateQRCodeBuffer } from "@/lib/qrcode";

export const CARD_WIDTH = 85;
export const CARD_HEIGHT = 54;

const BULK_RENDER_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );

  return results;
}

type JoueurForCard = CardRenderPlayer & {
  photo: string | null;
  qrToken: string;
  equipe: CardRenderPlayer["equipe"] & {
    competition: { nom: string; image?: string | null; abbreviation: string; fullControl: boolean };
  };
};

async function prepareCardAssets(
  joueur: JoueurForCard,
  competitionLogo: string | null,
) {
  const [qrPng, photoPng] = await Promise.all([
    generateQRCodeBuffer(joueur.qrToken, { competitionLogo }),
    joueur.photo ? loadPlayerPhotoBuffer(joueur.photo) : Promise.resolve(null),
  ]);

  return { qrPng, photoPng };
}

function pngToPdfDataUri(png: Buffer): string {
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function renderCardPdfPage(joueur: JoueurForCard): Promise<{
  dataUri: string;
}> {
  const competitionLogo = joueur.equipe.competition?.image ?? null;
  const { qrPng, photoPng } = await prepareCardAssets(joueur, competitionLogo);
  const png = await renderPlayerCardPng(joueur, qrPng, photoPng);
  return { dataUri: pngToPdfDataUri(png) };
}

function createCardPdf(): jsPDF {
  return new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
    compress: true,
  });
}

function addCardPage(doc: jsPDF, dataUri: string, isFirst: boolean): void {
  if (!isFirst) {
    doc.addPage([CARD_WIDTH, CARD_HEIGHT], "landscape");
  }
  doc.addImage(dataUri, "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT, undefined, "FAST");
}

export async function generatePlayerCard(joueurId: string): Promise<Buffer> {
  const joueur = await prisma.joueur.findUnique({
    where: { id: joueurId },
    include: { equipe: { include: { competition: true } } },
  });

  if (!joueur) {
    throw new Error("Joueur introuvable");
  }

  const { dataUri } = await renderCardPdfPage(joueur);
  const doc = createCardPdf();
  addCardPage(doc, dataUri, true);

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateAllPlayerCardsPdf(options?: {
  equipeId?: string;
  competitionId?: string;
  nom?: string;
}): Promise<Buffer> {
  const joueurs = await prisma.joueur.findMany({
    where: buildPlayerListWhere(options),
    include: { equipe: { include: { competition: true } } },
    orderBy: [{ equipe: { nom: "asc" } }, { nom: "asc" }, { prenom: "asc" }],
  });

  if (joueurs.length === 0) {
    throw new Error("Aucun joueur trouvé");
  }

  const pages = await mapWithConcurrency(
    joueurs,
    BULK_RENDER_CONCURRENCY,
    (joueur) => renderCardPdfPage(joueur),
  );

  const doc = createCardPdf();
  pages.forEach((page, index) => {
    addCardPage(doc, page.dataUri, index === 0);
  });

  return Buffer.from(doc.output("arraybuffer"));
}

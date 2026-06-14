import { jsPDF } from "jspdf";
import { PREVIEW_PLAYER_LICENSE } from "@/lib/playerCardMock";
import { prisma } from "@/lib/prisma";
import {
  loadPlayerPhotoBuffer,
  renderPlayerCardPng,
} from "@/lib/playerCardRender";
import type { CardRenderPlayer } from "@/lib/playerCardSvg";
import { generateQRCodeBuffer } from "@/lib/qrcode";

export const CARD_WIDTH = 85;
export const CARD_HEIGHT = 54;

type JoueurForCard = CardRenderPlayer & {
  photo: string | null;
  qrToken: string;
};

async function prepareCardAssets(joueur: JoueurForCard) {
  const [qrPng, photoPng] = await Promise.all([
    generateQRCodeBuffer(joueur.qrToken),
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
  const { qrPng, photoPng } = await prepareCardAssets(joueur);
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
}): Promise<Buffer> {
  const joueurs = await prisma.joueur.findMany({
    where: options?.equipeId ? { equipeId: options.equipeId } : undefined,
    include: { equipe: { include: { competition: true } } },
    orderBy: [{ equipe: { nom: "asc" } }, { nom: "asc" }, { prenom: "asc" }],
  });

  if (joueurs.length === 0) {
    throw new Error("Aucun joueur trouvé");
  }

  const pages = await Promise.all(
    joueurs.map((joueur) => renderCardPdfPage(joueur)),
  );

  const doc = createCardPdf();
  pages.forEach((page, index) => {
    addCardPage(doc, page.dataUri, index === 0);
  });

  return Buffer.from(doc.output("arraybuffer"));
}

/** PDF de démonstration (joueur fictif) pour itérer sur le design. */
export async function generatePreviewPlayerCard(): Promise<Buffer> {
  const { dataUri } = await renderCardPdfPage(PREVIEW_PLAYER_LICENSE);
  const doc = createCardPdf();
  addCardPage(doc, dataUri, true);
  return Buffer.from(doc.output("arraybuffer"));
}

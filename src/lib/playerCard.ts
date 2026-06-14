import path from "path";
import { jsPDF, GState, type jsPDF as JsPDFType } from "jspdf";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qrcode";

export const CARD_WIDTH = 85;
export const CARD_HEIGHT = 54;

type JoueurForCard = {
  id: string;
  nom: string;
  prenom: string;
  numero: number;
  poste: string;
  photo: string | null;
  qrToken: string;
  equipe: {
    nom: string;
    competition: { nom: string };
  };
};

async function loadPhotoDataUrl(relativePath: string): Promise<string | null> {
  try {
    const filepath = path.join(
      process.cwd(),
      "public",
      relativePath.replace(/^\//, ""),
    );
    const pngBuffer = await sharp(filepath).png().toBuffer();

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function drawPlayerCardOnDoc(
  doc: JsPDFType,
  joueur: JoueurForCard,
  qrCodeDataUrl: string,
  photoDataUrl: string | null,
): void {
  doc.setFillColor(26, 71, 42);
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, "F");

  doc.setGState(new GState({ opacity: 0.1 }));
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(52);
  doc.text(String(joueur.numero), CARD_WIDTH / 2, CARD_HEIGHT / 2, {
    align: "center",
  });
  doc.setGState(new GState({ opacity: 1 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(joueur.equipe.competition.nom, CARD_WIDTH / 2, 6, {
    align: "center",
  });

  const photoX = 5;
  const photoY = 12;
  const photoW = 18;
  const photoH = 22;

  if (photoDataUrl) {
    doc.addImage(photoDataUrl, "PNG", photoX, photoY, photoW, photoH);
  } else {
    doc.setFillColor(150, 150, 150);
    doc.rect(photoX, photoY, photoW, photoH, "F");
  }

  const textX = photoX + photoW + 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`${joueur.prenom} ${joueur.nom}`, textX, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 215, 0);
  doc.text(`#${joueur.numero} · ${joueur.poste}`, textX, 24);

  doc.setTextColor(255, 255, 255);
  doc.text(joueur.equipe.nom, textX, 30);

  const qrSize = 16;
  doc.addImage(
    qrCodeDataUrl,
    "PNG",
    CARD_WIDTH - qrSize - 4,
    CARD_HEIGHT - qrSize - 4,
    qrSize,
    qrSize,
  );
}

async function prepareCardAssets(joueur: JoueurForCard) {
  const [qrCodeDataUrl, photoDataUrl] = await Promise.all([
    generateQRCode(joueur.qrToken),
    joueur.photo ? loadPhotoDataUrl(joueur.photo) : Promise.resolve(null),
  ]);

  return { qrCodeDataUrl, photoDataUrl };
}

export async function generatePlayerCard(joueurId: string): Promise<Buffer> {
  const joueur = await prisma.joueur.findUnique({
    where: { id: joueurId },
    include: { equipe: { include: { competition: true } } },
  });

  if (!joueur) {
    throw new Error("Joueur introuvable");
  }

  const { qrCodeDataUrl, photoDataUrl } = await prepareCardAssets(joueur);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
  });

  drawPlayerCardOnDoc(doc, joueur, qrCodeDataUrl, photoDataUrl);

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

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
  });

  for (let index = 0; index < joueurs.length; index += 1) {
    const joueur = joueurs[index];
    const { qrCodeDataUrl, photoDataUrl } = await prepareCardAssets(joueur);

    if (index > 0) {
      doc.addPage([CARD_WIDTH, CARD_HEIGHT], "landscape");
    }

    drawPlayerCardOnDoc(doc, joueur, qrCodeDataUrl, photoDataUrl);
  }

  return Buffer.from(doc.output("arraybuffer"));
}

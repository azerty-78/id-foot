import path from "path";
import { jsPDF, GState, type jsPDF as JsPDFType } from "jspdf";
import { PREVIEW_PLAYER_LICENSE } from "@/lib/playerCardMock";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qrcode";

export const CARD_WIDTH = 85;
export const CARD_HEIGHT = 54;

type JoueurForCard = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
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
    const sharp = (await import("sharp")).default;
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
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, "F");

  doc.setFillColor(26, 71, 42);
  doc.rect(0, 8, CARD_WIDTH, CARD_HEIGHT - 8, "F");

  if (joueur.numero != null) {
    doc.setGState(new GState({ opacity: 0.07 }));
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.text(String(joueur.numero), CARD_WIDTH / 2, CARD_HEIGHT / 2 + 4, {
      align: "center",
    });
    doc.setGState(new GState({ opacity: 1 }));
  }

  doc.setFillColor(0, 0, 0);
  doc.setGState(new GState({ opacity: 0.2 }));
  doc.rect(0, 0, CARD_WIDTH, 8, "F");
  doc.setGState(new GState({ opacity: 1 }));

  doc.setFillColor(57, 231, 95);
  doc.roundedRect(4, 2.2, 14, 3.6, 0.8, 0.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5);
  doc.setTextColor(13, 27, 42);
  doc.text("ID FOOT", 11, 4.6, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text(joueur.equipe.competition.nom, CARD_WIDTH - 4, 4.6, {
    align: "right",
  });

  const photoX = 5;
  const photoY = 10;
  const photoSize = 20;

  if (photoDataUrl) {
    doc.addImage(photoDataUrl, "PNG", photoX, photoY, photoSize, photoSize);
  } else {
    doc.setFillColor(80, 100, 120);
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const initials = `${joueur.prenom.charAt(0)}${joueur.nom.charAt(0)}`.toUpperCase();
    doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 1.5, {
      align: "center",
    });
  }

  const fieldX = photoX;
  let fieldY = photoY + photoSize + 2.5;
  const fieldMaxW = 34;

  function drawField(label: string, value: string, highlight = false) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.2);
    doc.setTextColor(150, 165, 180);
    doc.text(label.toUpperCase(), fieldX, fieldY);

    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.setFontSize(highlight ? 7.5 : 6.5);
    doc.setTextColor(highlight ? 57 : 255, highlight ? 231 : 255, highlight ? 95 : 255);
    doc.text(value, fieldX, fieldY + 2.6, { maxWidth: fieldMaxW });

    fieldY += 5.2;
  }

  drawField("Nom", `${joueur.prenom} ${joueur.nom}`);

  const rowY = fieldY;
  const colWidth = 16;

  function drawFieldAt(
    x: number,
    y: number,
    label: string,
    value: string,
    highlight = false,
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.2);
    doc.setTextColor(150, 165, 180);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.setFontSize(highlight ? 7.5 : 6.5);
    doc.setTextColor(highlight ? 57 : 255, highlight ? 231 : 255, highlight ? 95 : 255);
    doc.text(value, x, y + 2.6, { maxWidth: colWidth });
  }

  drawFieldAt(
    fieldX,
    rowY,
    "Dorsal",
    joueur.numero != null ? `#${joueur.numero}` : "—",
    joueur.numero != null,
  );
  drawFieldAt(fieldX + colWidth + 2, rowY, "Poste", joueur.poste?.trim() || "—");
  fieldY += 5.2;

  drawField("Club", joueur.equipe.nom);

  const qrSize = 28;
  const qrX = CARD_WIDTH - qrSize - 4;
  const qrY = 9;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 0.8, qrY - 0.8, qrSize + 1.6, qrSize + 1.6, 1.2, 1.2, "F");
  doc.setDrawColor(57, 231, 95);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 0.8, qrY - 0.8, qrSize + 1.6, qrSize + 1.6, 1.2, 1.2, "S");

  doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.5);
  doc.setTextColor(57, 231, 95);
  doc.text("SCANNER ICI", qrX + qrSize / 2, qrY + qrSize + 2.8, {
    align: "center",
  });

  doc.setFillColor(0, 0, 0);
  doc.setGState(new GState({ opacity: 0.18 }));
  doc.rect(0, CARD_HEIGHT - 6, CARD_WIDTH, 6, "F");
  doc.setGState(new GState({ opacity: 1 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.5);
  doc.setTextColor(140, 155, 170);
  doc.text("LICENCE JOUEUR", 5, CARD_HEIGHT - 2.2);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 175, 190);
  doc.text(`ID ${joueur.id.slice(0, 8).toUpperCase()}`, CARD_WIDTH - 5, CARD_HEIGHT - 2.2, {
    align: "right",
  });
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

/** PDF de démonstration (joueur fictif) pour itérer sur le design. */
export async function generatePreviewPlayerCard(): Promise<Buffer> {
  const joueur = PREVIEW_PLAYER_LICENSE;
  const { qrCodeDataUrl, photoDataUrl } = await prepareCardAssets(joueur);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
  });

  drawPlayerCardOnDoc(doc, joueur, qrCodeDataUrl, photoDataUrl);

  return Buffer.from(doc.output("arraybuffer"));
}

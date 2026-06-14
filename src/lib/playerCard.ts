import path from "path";
import { jsPDF, GState, type jsPDF as JsPDFType } from "jspdf";
import { PREVIEW_PLAYER_LICENSE } from "@/lib/playerCardMock";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qrcode";

export const CARD_WIDTH = 85;
export const CARD_HEIGHT = 54;

/** Grille de référence design (px) → proportions PDF */
const REF_W = 500;
const REF_H = 330;

function sx(value: number): number {
  return (value / REF_W) * CARD_WIDTH;
}

function sy(value: number): number {
  return (value / REF_H) * CARD_HEIGHT;
}

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
  const padX = sx(16);
  const headerH = sy(40);
  const footerH = sy(35);
  const bodyTop = headerH;
  const bodyH = CARD_HEIGHT - headerH - footerH;
  const gap = sx(24);
  const contentW = CARD_WIDTH - padX * 2;
  const leftW = (contentW - gap) * 0.42;
  const rightW = (contentW - gap) * 0.58;
  const leftX = padX;
  const rightX = padX + leftW + gap;

  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT, "F");

  doc.setFillColor(26, 71, 42);
  doc.rect(0, headerH, CARD_WIDTH, bodyH, "F");

  if (joueur.numero != null) {
    doc.setGState(new GState({ opacity: 0.04 }));
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(52);
    doc.text(String(joueur.numero), CARD_WIDTH / 2, CARD_HEIGHT / 2 + 2, {
      align: "center",
    });
    doc.setGState(new GState({ opacity: 1 }));
  }

  /* Header */
  doc.setFillColor(0, 0, 0);
  doc.setGState(new GState({ opacity: 0.2 }));
  doc.rect(0, 0, CARD_WIDTH, headerH, "F");
  doc.setGState(new GState({ opacity: 1 }));

  doc.setFillColor(57, 231, 95);
  doc.roundedRect(padX, sy(8), sx(56), sy(14), 1.2, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(13, 27, 42);
  doc.text("ID FOOT", padX + sx(28), sy(16.5), { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text(joueur.equipe.competition.nom, CARD_WIDTH - padX, sy(16.5), {
    align: "right",
  });

  /* Séparateur colonnes */
  doc.setDrawColor(255, 255, 255);
  doc.setGState(new GState({ opacity: 0.12 }));
  doc.setLineWidth(0.15);
  doc.line(leftX + leftW + gap / 2, bodyTop + sy(8), leftX + leftW + gap / 2, bodyTop + bodyH - sy(8));
  doc.setGState(new GState({ opacity: 1 }));

  /* Photo — 180×180 px, centrée colonne gauche */
  const photoSize = sx(180);
  const photoX = leftX + (leftW - photoSize) / 2;
  const photoY = bodyTop + sy(10);

  if (photoDataUrl) {
    doc.addImage(photoDataUrl, "PNG", photoX, photoY, photoSize, photoSize);
  } else {
    doc.setFillColor(80, 100, 120);
    doc.roundedRect(photoX, photoY, photoSize, photoSize, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    const initials = `${joueur.prenom.charAt(0)}${joueur.nom.charAt(0)}`.toUpperCase();
    doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 2, {
      align: "center",
    });
  }

  let fieldY = photoY + photoSize + sy(20);
  const fieldMaxW = leftW - sx(4);

  function drawField(
    label: string,
    value: string,
    options?: { highlight?: boolean; name?: boolean },
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(150, 165, 180);
    doc.text(label.toUpperCase(), leftX, fieldY);

    doc.setFont("helvetica", options?.name || options?.highlight ? "bold" : "normal");
    doc.setFontSize(options?.name ? 9 : options?.highlight ? 8 : 7);
    doc.setTextColor(
      options?.highlight ? 57 : 255,
      options?.highlight ? 231 : 255,
      options?.highlight ? 95 : 255,
    );
    doc.text(value, leftX, fieldY + sy(8), { maxWidth: fieldMaxW });

    fieldY += sy(options?.name ? 22 : 18);
  }

  drawField("Nom", `${joueur.prenom} ${joueur.nom}`, { name: true });

  const rowY = fieldY + sy(4);
  const halfW = leftW / 2 - sx(2);

  function drawFieldAt(
    x: number,
    y: number,
    label: string,
    value: string,
    highlight = false,
  ) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(150, 165, 180);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", highlight ? "bold" : "normal");
    doc.setFontSize(highlight ? 8 : 7);
    doc.setTextColor(highlight ? 57 : 255, highlight ? 231 : 255, highlight ? 95 : 255);
    doc.text(value, x, y + sy(8), { maxWidth: halfW });
  }

  doc.setDrawColor(255, 255, 255);
  doc.setGState(new GState({ opacity: 0.1 }));
  doc.line(leftX, rowY - sy(6), leftX + leftW, rowY - sy(6));
  doc.setGState(new GState({ opacity: 1 }));

  drawFieldAt(
    leftX,
    rowY,
    "Dorsal",
    joueur.numero != null ? `#${joueur.numero}` : "—",
    joueur.numero != null,
  );
  drawFieldAt(leftX + halfW + sx(4), rowY, "Poste", joueur.poste?.trim() || "—");
  fieldY = rowY + sy(22);

  doc.setGState(new GState({ opacity: 0.1 }));
  doc.line(leftX, fieldY - sy(4), leftX + leftW, fieldY - sy(4));
  doc.setGState(new GState({ opacity: 1 }));

  drawField("Club", joueur.equipe.nom);

  /* QR — 250×250 px, quiet zone 16px */
  const qrBox = sx(250);
  const quiet = sx(16);
  const qrInner = qrBox - quiet * 2;
  const qrX = rightX + (rightW - qrBox) / 2;
  const qrY = bodyTop + sy(6);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX, qrY, qrBox, qrBox, 1.5, 1.5, "F");
  doc.setDrawColor(57, 231, 95);
  doc.setLineWidth(0.4);
  doc.roundedRect(qrX, qrY, qrBox, qrBox, 1.5, 1.5, "S");

  doc.addImage(
    qrCodeDataUrl,
    "PNG",
    qrX + quiet,
    qrY + quiet,
    qrInner,
    qrInner,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5);
  doc.setTextColor(57, 231, 95);
  doc.text("SCANNER ICI", qrX + qrBox / 2, qrY + qrBox + sy(12), {
    align: "center",
  });

  /* Footer */
  doc.setFillColor(0, 0, 0);
  doc.setGState(new GState({ opacity: 0.18 }));
  doc.rect(0, CARD_HEIGHT - footerH, CARD_WIDTH, footerH, "F");
  doc.setGState(new GState({ opacity: 1 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5);
  doc.setTextColor(140, 155, 170);
  doc.text("LICENCE JOUEUR", padX, CARD_HEIGHT - footerH / 2 + 1);

  doc.setFont("helvetica", "normal");
  doc.text(`ID ${joueur.id.slice(0, 8).toUpperCase()}`, CARD_WIDTH - padX, CARD_HEIGHT - footerH / 2 + 1, {
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

import path from "path";
import { jsPDF, GState } from "jspdf";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qrcode";

const CARD_WIDTH = 85;
const CARD_HEIGHT = 54;

async function loadPhotoDataUrl(relativePath: string): Promise<string | null> {
  try {
    const filepath = path.join(
      process.cwd(),
      "public",
      relativePath.replace(/^\//, "")
    );
    const pngBuffer = await sharp(filepath).png().toBuffer();

    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function generatePlayerCard(joueurId: string): Promise<Buffer> {
  const joueur = await prisma.joueur.findUnique({
    where: { id: joueurId },
    include: { equipe: { include: { competition: true } } },
  });

  if (!joueur) {
    throw new Error("Joueur introuvable");
  }

  const qrCodeDataUrl = await generateQRCode(joueur.qrToken);
  const photoDataUrl = joueur.photo
    ? await loadPhotoDataUrl(joueur.photo)
    : null;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
  });

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
    qrSize
  );

  return Buffer.from(doc.output("arraybuffer"));
}

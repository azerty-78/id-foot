import {
  CARD_COLORS,
  CARD_FONT,
  CARD_NAME_TO_STATS_GAP,
  CARD_QR_BOX,
  CARD_QR_INNER,
  CARD_QR_PDF_PAD_TOP,
  CARD_QR_PDF_PAD_X,
  CARD_RENDER_HEIGHT,
  CARD_RENDER_WIDTH,
  PERSONNEL_CARD_COLORS,
} from "@/lib/playerCardColors";
import { getInterFontFaceDefs } from "@/lib/playerCardFont";
import { getPlayerCardBrandLabel } from "@/lib/playerCardBrand";
import { isPersonnelLicense, type LicenseType } from "@/types/player";

export type CardRenderPlayer = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
  licenseType?: LicenseType | string | null;
  fonctionPersonnel?: string | null;
  equipe: {
    nom: string;
    competition: {
      nom: string;
      abbreviation: string;
      fullControl: boolean;
    };
  };
};

export type PlayerCardLayout = {
  width: number;
  height: number;
  photoX: number;
  photoY: number;
  photoSize: number;
  qrBoxX: number;
  qrBoxY: number;
  qrBoxSize: number;
  qrInnerX: number;
  qrInnerY: number;
  qrInnerSize: number;
};

const NAME_FONT_SIZE = 17;
const NAME_LINE_HEIGHT = 20;
/** Gras 800 — légèrement plus large pour anticiper le débordement vers le QR */
const NAME_CHAR_WIDTH_RATIO = 0.62;
const NAME_WIDTH_SAFETY = 6;

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * NAME_CHAR_WIDTH_RATIO;
}

function wrapPlayerName(text: string, maxWidthPx: number, fontSize: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return ["—"];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (estimateTextWidth(candidate, fontSize) <= maxWidthPx) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    // Mot seul plus large que la colonne : coupe par caractères
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (estimateTextWidth(next, fontSize) <= maxWidthPx) {
        chunk = next;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [trimmed];
}

function buildNameTextSvg(fieldX: number, fieldY: number, fieldW: number, fullName: string): {
  svg: string;
  statsRowY: number;
} {
  const nameStartY = fieldY + 16;
  const nameLines = wrapPlayerName(fullName, fieldW - NAME_WIDTH_SAFETY, NAME_FONT_SIZE);
  const nameBlockHeight = nameLines.length * NAME_LINE_HEIGHT;
  const statsRowY = nameStartY + nameBlockHeight + CARD_NAME_TO_STATS_GAP;

  const tspans = nameLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : NAME_LINE_HEIGHT;
      return `<tspan x="${fieldX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const svg = `<text x="${fieldX}" y="${nameStartY}" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="${NAME_FONT_SIZE}" font-weight="800" letter-spacing="-0.34">${tspans}</text>`;

  return { svg, statsRowY };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function computeLayout(): PlayerCardLayout {
  const W = CARD_RENDER_WIDTH;
  const H = CARD_RENDER_HEIGHT;
  const pad = 16;
  const headerH = 40;
  const mainPadY = 12;
  const contentTop = headerH + mainPadY;
  const gap = 24;
  const contentW = W - pad * 2;
  const leftW = (contentW - gap) * 0.42;
  const rightW = (contentW - gap) * 0.58;
  const leftX = pad;
  const rightX = pad + leftW + gap;
  const identityPadR = 12;

  const photoSize = 140;
  const photoX = leftX + (leftW - identityPadR - photoSize) / 2;
  const photoY = contentTop;

  const footerH = 35;
  const footerTop = H - footerH;
  const qrBoxSize = CARD_QR_BOX;
  const qrBoxX = Math.round(rightX + (rightW - qrBoxSize) / 2);
  const qrBoxY = Math.max(contentTop, footerTop - qrBoxSize - 12);
  const qrInnerSize = CARD_QR_INNER;
  const qrInnerX = qrBoxX + CARD_QR_PDF_PAD_X;
  const qrInnerY = qrBoxY + CARD_QR_PDF_PAD_TOP;

  return {
    width: W,
    height: H,
    photoX: Math.round(photoX),
    photoY: Math.round(photoY),
    photoSize,
    qrBoxX,
    qrBoxY,
    qrBoxSize,
    qrInnerX,
    qrInnerY,
    qrInnerSize,
  };
}

/** Grille 500×330 — fond vectoriel sans images raster (composées ensuite via Sharp). */
export function buildPlayerCardSvg(
  joueur: CardRenderPlayer,
  options?: { hasPhoto?: boolean },
): { svg: string; layout: PlayerCardLayout } {
  const layout = computeLayout();
  const { width: W, height: H } = layout;
  const pad = 16;
  const headerH = 40;
  const footerH = 35;
  const mainPadY = 12;
  const contentTop = headerH + mainPadY;
  const gap = 24;
  const contentW = W - pad * 2;
  const leftW = (contentW - gap) * 0.42;
  const leftX = pad;
  const identityPadR = 12;

  const { photoX, photoY, photoSize } = layout;

  const fieldW = leftW - identityPadR;
  const fieldX = leftX;
  const fieldY = photoY + photoSize + 12;

  const fullName = `${joueur.prenom} ${joueur.nom}`;
  const isPersonnel = isPersonnelLicense(joueur.licenseType);
  const dorsal = joueur.numero != null ? `#${joueur.numero}` : "—";
  const poste = joueur.poste?.trim() || "—";
  const fonction = joueur.fonctionPersonnel?.trim() || "—";
  const brandLabel = getPlayerCardBrandLabel(joueur.equipe.competition);
  const palette = isPersonnel ? PERSONNEL_CARD_COLORS : null;
  const accent = palette?.accent ?? CARD_COLORS.green;
  const accentText = palette?.accentText ?? CARD_COLORS.navy;
  const qrStroke = palette?.qrStroke ?? CARD_COLORS.green;
  const footerLabel = isPersonnel ? "LICENCE PERSONNEL" : "LICENCE JOUEUR";
  const brandBadgeText = isPersonnel ? "STAFF" : brandLabel;

  const { qrBoxX, qrBoxY, qrBoxSize } = layout;
  const { svg: nameTextSvg, statsRowY: rowY } = buildNameTextSvg(
    fieldX,
    fieldY,
    fieldW,
    fullName,
  );

  const sepX = leftX + leftW;
  const bodyBottom = H - footerH;

  const hasPhoto = options?.hasPhoto ?? false;
  const photoBlock = hasPhoto
    ? ""
    : `<rect x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" rx="16" fill="${CARD_COLORS.photoPlaceholder}"/>
       <text x="${photoX + photoSize / 2}" y="${photoY + photoSize / 2 + 7}" text-anchor="middle" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="22" font-weight="700">${escapeXml(getInitials(joueur.prenom, joueur.nom))}</text>`;

  const fontFaceStyles = getInterFontFaceDefs();

  const bgGradient = isPersonnel
    ? `<linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PERSONNEL_CARD_COLORS.gradientStart}"/>
      <stop offset="55%" stop-color="${PERSONNEL_CARD_COLORS.gradientMid}"/>
      <stop offset="100%" stop-color="${PERSONNEL_CARD_COLORS.gradientEnd}"/>
    </linearGradient>`
    : `<linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${CARD_COLORS.greenDark}"/>
      <stop offset="58%" stop-color="${CARD_COLORS.navy}"/>
      <stop offset="100%" stop-color="${CARD_COLORS.navy}"/>
    </linearGradient>`;

  const statsBlock = isPersonnel
    ? `<line x1="${fieldX}" y1="${rowY - 8}" x2="${fieldX + fieldW}" y2="${rowY - 8}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${fieldX}" y="${rowY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">FONCTION</text>
  <text x="${fieldX}" y="${rowY + 15}" fill="${accent}" font-family="${CARD_FONT}" font-size="12" font-weight="700">${escapeXml(fonction)}</text>`
    : `<line x1="${fieldX}" y1="${rowY - 8}" x2="${fieldX + fieldW}" y2="${rowY - 8}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${fieldX}" y="${rowY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">DORSAL</text>
  <text x="${fieldX}" y="${rowY + 15}" fill="${CARD_COLORS.green}" font-family="${CARD_FONT}" font-size="14" font-weight="900">${escapeXml(dorsal)}</text>
  <text x="${fieldX + fieldW / 2 + 4}" y="${rowY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">POSTE</text>
  <text x="${fieldX + fieldW / 2 + 4}" y="${rowY + 15}" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="12" font-weight="700">${escapeXml(poste)}</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${fontFaceStyles ? `<style><![CDATA[${fontFaceStyles}]]></style>` : ""}
    ${bgGradient}
  </defs>

  <rect width="${W}" height="${H}" rx="20" fill="url(#cardBg)"/>
  <rect width="${W}" height="${H}" rx="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <line x1="0" y1="1" x2="${W}" y2="1" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  ${
    !isPersonnel && joueur.numero != null
      ? `<text x="${W / 2}" y="${H / 2 + 20}" text-anchor="middle" fill="${CARD_COLORS.watermark}" font-family="${CARD_FONT}" font-size="120" font-weight="900">${joueur.numero}</text>`
      : ""
  }

  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="${headerH}" fill="${CARD_COLORS.headerOverlay}"/>
  <line x1="0" y1="${headerH}" x2="${W}" y2="${headerH}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <rect x="${pad}" y="13" width="${isPersonnel ? 56 : 72}" height="18" rx="9" fill="${accent}"/>
  <text x="${pad + (isPersonnel ? 28 : 36)}" y="25.5" text-anchor="middle" fill="${accentText}" font-family="${CARD_FONT}" font-size="9" font-weight="800" letter-spacing="1.2">${escapeXml(brandBadgeText)}</text>
  <text x="${W - pad}" y="25" text-anchor="end" fill="${CARD_COLORS.labelBright}" font-family="${CARD_FONT}" font-size="10" font-weight="700" letter-spacing="0.8">${escapeXml(joueur.equipe.competition.nom.toUpperCase())}</text>

  <!-- Séparateur colonnes -->
  <line x1="${sepX}" y1="${contentTop}" x2="${sepX}" y2="${bodyBottom - mainPadY}" stroke="${CARD_COLORS.divider}" stroke-width="1"/>

  <!-- Photo -->
  <g>
    <rect x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" rx="16" fill="${CARD_COLORS.photoBg}" stroke="${CARD_COLORS.photoBorder}" stroke-width="2"/>
    ${photoBlock}
  </g>

  <!-- Nom -->
  <text x="${fieldX}" y="${fieldY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">NOM</text>
  ${nameTextSvg}

  <!-- Stats -->
  ${statsBlock}

  <!-- QR (cadre blanc — image composée ensuite) -->
  <g>
    <rect x="${qrBoxX}" y="${qrBoxY}" width="${qrBoxSize}" height="${qrBoxSize}" rx="10" fill="${CARD_COLORS.white}" stroke="${qrStroke}" stroke-width="2"/>
  </g>

  <!-- Footer -->
  <rect x="0" y="${H - footerH}" width="${W}" height="${footerH}" fill="${CARD_COLORS.footerOverlay}"/>
  <line x1="0" y1="${H - footerH}" x2="${W}" y2="${H - footerH}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${pad}" y="${H - footerH / 2 + 4}" fill="${CARD_COLORS.footerText}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.4">${footerLabel}</text>
  <text x="${W - pad}" y="${H - footerH / 2 + 4}" text-anchor="end" fill="${CARD_COLORS.labelBright}" font-family="${CARD_FONT}" font-size="10" font-weight="700">${escapeXml(joueur.equipe.nom)}</text>
</svg>`;

  return { svg, layout };
}

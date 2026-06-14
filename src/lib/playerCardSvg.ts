import {
  CARD_COLORS,
  CARD_FONT,
  CARD_RENDER_HEIGHT,
  CARD_RENDER_WIDTH,
} from "@/lib/playerCardColors";

export type CardRenderPlayer = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
  equipe: {
    nom: string;
    competition: { nom: string };
  };
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDataUri(buffer: Buffer, mime = "image/png"): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

/** Grille 500×330 — mêmes proportions que PlayerLicenseCard + globals.css */
export function buildPlayerCardSvg(
  joueur: CardRenderPlayer,
  qrPng: Buffer,
  photoPng: Buffer | null,
): string {
  const W = CARD_RENDER_WIDTH;
  const H = CARD_RENDER_HEIGHT;
  const pad = 16;
  const headerH = 40;
  const footerH = 35;
  const mainPadY = 12;
  const contentTop = headerH + mainPadY;
  const gap = 24;
  const contentW = W - pad * 2;
  const leftW = (contentW - gap) * 0.42;
  const rightW = (contentW - gap) * 0.58;
  const leftX = pad;
  const rightX = pad + leftW + gap;
  const identityPadR = 12;

  const photoSize = 180;
  const photoX = leftX + (leftW - identityPadR - photoSize) / 2;
  const photoY = contentTop;

  const fieldW = leftW - identityPadR;
  const fieldX = leftX;
  let fieldY = photoY + photoSize + 20;

  const fullName = `${joueur.prenom} ${joueur.nom}`;
  const dorsal = joueur.numero != null ? `#${joueur.numero}` : "—";
  const poste = joueur.poste?.trim() || "—";
  const shortId = joueur.id.slice(0, 8).toUpperCase();

  const qrBox = 250;
  const qrQuiet = 16;
  const qrInner = qrBox - qrQuiet * 2;
  const qrX = rightX + (rightW - qrBox) / 2;
  const qrY = contentTop + 2;

  const sepX = leftX + leftW;
  const bodyBottom = H - footerH;

  const photoBlock = photoPng
    ? `<image href="${toDataUri(photoPng)}" x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`
    : `<rect x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" rx="16" fill="${CARD_COLORS.photoPlaceholder}"/>
       <text x="${photoX + photoSize / 2}" y="${photoY + photoSize / 2 + 8}" text-anchor="middle" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="28" font-weight="700">${escapeXml(getInitials(joueur.prenom, joueur.nom))}</text>`;

  const rowY = fieldY + 34;
  const clubY = rowY + 38;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${CARD_COLORS.greenDark}"/>
      <stop offset="58%" stop-color="${CARD_COLORS.navy}"/>
      <stop offset="100%" stop-color="${CARD_COLORS.navy}"/>
    </linearGradient>
    <clipPath id="photoClip">
      <rect x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" rx="16"/>
    </clipPath>
  </defs>

  <rect width="${W}" height="${H}" rx="20" fill="url(#cardBg)"/>
  <rect width="${W}" height="${H}" rx="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  ${
    joueur.numero != null
      ? `<text x="${W / 2}" y="${H / 2 + 20}" text-anchor="middle" fill="${CARD_COLORS.watermark}" font-family="${CARD_FONT}" font-size="120" font-weight="900">${joueur.numero}</text>`
      : ""
  }

  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="${headerH}" fill="${CARD_COLORS.headerOverlay}"/>
  <line x1="0" y1="${headerH}" x2="${W}" y2="${headerH}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <rect x="${pad}" y="13" width="72" height="18" rx="9" fill="${CARD_COLORS.green}"/>
  <text x="${pad + 36}" y="25.5" text-anchor="middle" fill="${CARD_COLORS.navy}" font-family="${CARD_FONT}" font-size="9" font-weight="800" letter-spacing="1.2">ID FOOT</text>
  <text x="${W - pad}" y="25" text-anchor="end" fill="${CARD_COLORS.labelBright}" font-family="${CARD_FONT}" font-size="10" font-weight="700" letter-spacing="0.8">${escapeXml(joueur.equipe.competition.nom.toUpperCase())}</text>

  <!-- Séparateur colonnes -->
  <line x1="${sepX}" y1="${contentTop}" x2="${sepX}" y2="${bodyBottom - mainPadY}" stroke="${CARD_COLORS.divider}" stroke-width="1"/>

  <!-- Photo -->
  <rect x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" rx="16" fill="${CARD_COLORS.photoBg}" stroke="${CARD_COLORS.photoBorder}" stroke-width="2"/>
  ${photoBlock}

  <!-- Nom -->
  <text x="${fieldX}" y="${fieldY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">NOM</text>
  <text x="${fieldX}" y="${fieldY + 16}" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="17" font-weight="800">${escapeXml(fullName)}</text>

  <!-- Dorsal / Poste -->
  <line x1="${fieldX}" y1="${rowY - 8}" x2="${fieldX + fieldW}" y2="${rowY - 8}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${fieldX}" y="${rowY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">DORSAL</text>
  <text x="${fieldX}" y="${rowY + 15}" fill="${CARD_COLORS.green}" font-family="${CARD_FONT}" font-size="14" font-weight="900">${escapeXml(dorsal)}</text>
  <text x="${fieldX + fieldW / 2 + 4}" y="${rowY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">POSTE</text>
  <text x="${fieldX + fieldW / 2 + 4}" y="${rowY + 15}" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="12" font-weight="700">${escapeXml(poste)}</text>

  <!-- Club -->
  <line x1="${fieldX}" y1="${clubY - 8}" x2="${fieldX + fieldW}" y2="${clubY - 8}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${fieldX}" y="${clubY}" fill="${CARD_COLORS.label}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.1">CLUB</text>
  <text x="${fieldX}" y="${clubY + 15}" fill="${CARD_COLORS.white}" font-family="${CARD_FONT}" font-size="12" font-weight="700">${escapeXml(joueur.equipe.nom)}</text>

  <!-- QR -->
  <rect x="${qrX}" y="${qrY}" width="${qrBox}" height="${qrBox}" rx="10" fill="${CARD_COLORS.white}" stroke="${CARD_COLORS.green}" stroke-width="2"/>
  <image href="${toDataUri(qrPng)}" x="${qrX + qrQuiet}" y="${qrY + qrQuiet}" width="${qrInner}" height="${qrInner}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${qrX + qrBox / 2}" y="${qrY + qrBox + 14}" text-anchor="middle" fill="${CARD_COLORS.green}" font-family="${CARD_FONT}" font-size="9" font-weight="800" letter-spacing="1.4">SCANNER ICI</text>

  <!-- Footer -->
  <rect x="0" y="${H - footerH}" width="${W}" height="${footerH}" fill="${CARD_COLORS.footerOverlay}"/>
  <line x1="0" y1="${H - footerH}" x2="${W}" y2="${H - footerH}" stroke="${CARD_COLORS.dividerSoft}" stroke-width="1"/>
  <text x="${pad}" y="${H - footerH / 2 + 4}" fill="${CARD_COLORS.footerText}" font-family="${CARD_FONT}" font-size="8" font-weight="700" letter-spacing="1.4">LICENCE JOUEUR</text>
  <text x="${W - pad}" y="${H - footerH / 2 + 4}" text-anchor="end" fill="${CARD_COLORS.footerId}" font-family="${CARD_FONT}" font-size="9" font-weight="600" letter-spacing="0.6">ID ${shortId}</text>
</svg>`;
}

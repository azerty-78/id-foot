/** Nom de fichier PDF sûr (ASCII, sans espaces ni accents). */
export function sanitizePdfFilename(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return slug || "carte";
}

export function buildPlayerCardFilename(prenom: string, nom: string): string {
  return `${sanitizePdfFilename(`${prenom} ${nom}`)}.pdf`;
}

export function buildTeamCardsFilename(equipeNom: string): string {
  return `${sanitizePdfFilename(equipeNom)}.pdf`;
}

export function buildCompetitionCardsFilename(competitionNom: string): string {
  return `${sanitizePdfFilename(competitionNom)}.pdf`;
}

export function pdfContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export function parseContentDispositionFilename(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;

  const utf8Match = header.match(/filename\*=UTF-8''([^;\s]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      /* ignore */
    }
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const bareMatch = header.match(/filename=([^;\s]+)/i);
  if (bareMatch?.[1]) return bareMatch[1].replace(/^"|"$/g, "");

  return fallback;
}

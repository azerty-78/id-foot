export type CompetitionBrandContext = {
  abbreviation: string;
  fullControl: boolean;
};

/** Libellé du badge carte licence : abréviation compétition si fullControl, sinon ID FOOT. */
export function getPlayerCardBrandLabel(
  competition: CompetitionBrandContext | null | undefined,
): string {
  if (competition?.fullControl) {
    return competition.abbreviation;
  }
  return "ID FOOT";
}

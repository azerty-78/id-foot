import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPlayerCardSvg } from "@/lib/playerCardSvg";

const basePlayer = {
  id: "test-id",
  nom: "Benjamin",
  prenom: "Aboubakar",
  numero: 78,
  poste: "Arrière gauche",
  equipe: {
    nom: "FC Real Madrid",
    competition: { nom: "Championnat inter village", abbreviation: "CIV", fullControl: false },
  },
};

describe("buildPlayerCardSvg", () => {
  it("retourne le nom sur plusieurs lignes si le texte est trop long", () => {
    const { svg } = buildPlayerCardSvg(basePlayer, { hasPhoto: true });

    assert.match(svg, /<tspan[^>]*>Aboubakar<\/tspan>/);
    assert.match(svg, /<tspan[^>]*>Benjamin<\/tspan>/);
    assert.doesNotMatch(
      svg,
      /<tspan[^>]*>Aboubakar Benjamin<\/tspan>/,
    );
  });

  it("conserve un nom court sur une seule ligne", () => {
    const { svg } = buildPlayerCardSvg(
      {
        ...basePlayer,
        prenom: "Jean",
        nom: "Dupont",
      },
      { hasPhoto: true },
    );

    assert.match(svg, /<tspan[^>]*>Jean Dupont<\/tspan>/);
  });

  it("affiche la variante personnel sans dorsal", () => {
    const { svg } = buildPlayerCardSvg(
      {
        ...basePlayer,
        numero: null,
        poste: null,
        licenseType: "PERSONNEL",
        fonctionPersonnel: "Coach",
      },
      { hasPhoto: true },
    );

    assert.match(svg, /LICENCE PERSONNEL/);
    assert.match(svg, />FONCTION</);
    assert.match(svg, />Coach</);
    assert.doesNotMatch(svg, />DORSAL</);
    assert.match(svg, />STAFF</);
  });
});

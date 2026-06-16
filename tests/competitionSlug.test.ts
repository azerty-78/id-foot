import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveCompetitionAbbreviation,
  normalizeCompetitionAbbreviation,
  resolveCompetitionAbbreviation,
} from "@/lib/competitionSlug";

describe("deriveCompetitionAbbreviation", () => {
  it("prend la première lettre de chaque mot", () => {
    assert.equal(
      deriveCompetitionAbbreviation("Championnat Inter Village"),
      "CIV",
    );
  });

  it("gère les accents", () => {
    assert.equal(deriveCompetitionAbbreviation("Coupe Été Mafa"), "CEM");
  });

  it("retourne COMP pour un nom vide", () => {
    assert.equal(deriveCompetitionAbbreviation("   "), "COMP");
  });
});

describe("normalizeCompetitionAbbreviation", () => {
  it("met en majuscules et retire les caractères invalides", () => {
    assert.equal(normalizeCompetitionAbbreviation("ci-v"), "CIV");
  });
});

describe("resolveCompetitionAbbreviation", () => {
  it("utilise l'abréviation fournie", () => {
    assert.equal(
      resolveCompetitionAbbreviation({
        nom: "Championnat Inter Village",
        abbreviation: "civ",
      }),
      "CIV",
    );
  });

  it("dérive depuis le nom si absente", () => {
    assert.equal(
      resolveCompetitionAbbreviation({ nom: "Tournoi National" }),
      "TN",
    );
  });
});

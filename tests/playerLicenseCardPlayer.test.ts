import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapQrResponseToValidatedPlayer } from "../src/components/admin/scanner/types";
import { toPlayerLicenseCardPlayer } from "../src/lib/playerLicenseCardPlayer";

describe("mapQrResponseToValidatedPlayer", () => {
  it("dérive abbreviation et fullControl si absents", () => {
    const player = mapQrResponseToValidatedPlayer({
      id: "p1",
      nom: "Dupont",
      prenom: "Jean",
      numero: 10,
      poste: "Milieu",
      photo: null,
      qrToken: "token",
      equipe: {
        nom: "FC Test",
        logo: null,
        competition: {
          nom: "Coupe Nationale",
          annee: 2026,
        },
      },
    });

    assert.equal(player.equipe.competition.abbreviation, "CN");
    assert.equal(player.equipe.competition.fullControl, false);
    assert.doesNotThrow(() => toPlayerLicenseCardPlayer(player));
  });
});

describe("toPlayerLicenseCardPlayer", () => {
  it("normalise les champs branding compétition", () => {
    const card = toPlayerLicenseCardPlayer({
      id: "p1",
      nom: "Dupont",
      prenom: "Jean",
      numero: 7,
      poste: "Attaquant",
      photo: null,
      qrToken: "token",
      equipe: {
        nom: "FC Test",
        competition: {
          nom: "Ligue Pro",
          fullControl: true,
        },
      },
    });

    assert.equal(card.equipe.competition.abbreviation, "LP");
    assert.equal(card.equipe.competition.fullControl, true);
  });
});

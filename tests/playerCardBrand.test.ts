import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPlayerCardBrandLabel } from "@/lib/playerCardBrand";

describe("getPlayerCardBrandLabel", () => {
  it("affiche ID FOOT par défaut", () => {
    assert.equal(
      getPlayerCardBrandLabel({ abbreviation: "CIV", fullControl: false }),
      "ID FOOT",
    );
    assert.equal(getPlayerCardBrandLabel(null), "ID FOOT");
  });

  it("affiche l'abréviation si fullControl est activé", () => {
    assert.equal(
      getPlayerCardBrandLabel({ abbreviation: "CIV", fullControl: true }),
      "CIV",
    );
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brandAssets } from "@/lib/brand";
import { resolveQrLogoSrc } from "@/lib/qrLogo";

describe("resolveQrLogoSrc", () => {
  it("utilise le logo compétition quand il existe", () => {
    assert.equal(
      resolveQrLogoSrc("/uploads/photos/comp.webp"),
      "/uploads/photos/comp.webp",
    );
  });

  it("repli sur ID FOOT sans logo compétition", () => {
    assert.equal(resolveQrLogoSrc(null), brandAssets.qrLogo);
    assert.equal(resolveQrLogoSrc(""), brandAssets.qrLogo);
    assert.equal(resolveQrLogoSrc("   "), brandAssets.qrLogo);
  });
});

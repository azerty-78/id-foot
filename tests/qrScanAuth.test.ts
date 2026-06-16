import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSafeCallbackUrl, isQrScanCallbackUrl } from "../src/lib/auth/callbackUrl";
import { buildQrScanPath, buildQrScanUrl } from "../src/lib/qrScanUrl";
import { extractToken } from "../src/components/admin/scanner/extractToken";

describe("resolveSafeCallbackUrl", () => {
  it("accepte un chemin interne", () => {
    assert.equal(
      resolveSafeCallbackUrl("/scan/abc-123", "/admin/dashboard"),
      "/scan/abc-123",
    );
  });

  it("rejette les URLs externes", () => {
    assert.equal(
      resolveSafeCallbackUrl("https://evil.test", "/admin/dashboard"),
      "/admin/dashboard",
    );
  });
});

describe("buildQrScanUrl", () => {
  it("pointe vers la page scan publique", () => {
    assert.equal(
      buildQrScanUrl("token-1", "https://id-foot.test"),
      "https://id-foot.test/scan/token-1",
    );
    assert.equal(buildQrScanPath("token-1"), "/scan/token-1");
  });
});

describe("extractToken", () => {
  it("extrait depuis /scan et /api/qr", () => {
    assert.equal(
      extractToken("https://id-foot.test/scan/8ded6094-979c-40df-9ad1-8a401dfe4f2c"),
      "8ded6094-979c-40df-9ad1-8a401dfe4f2c",
    );
    assert.equal(
      extractToken("https://id-foot.test/api/qr/8ded6094-979c-40df-9ad1-8a401dfe4f2c"),
      "8ded6094-979c-40df-9ad1-8a401dfe4f2c",
    );
  });
});

describe("isQrScanCallbackUrl", () => {
  it("détecte les callbacks scan", () => {
    assert.equal(isQrScanCallbackUrl("/scan/abc"), true);
    assert.equal(isQrScanCallbackUrl("/admin/dashboard"), false);
  });
});

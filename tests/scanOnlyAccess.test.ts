import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isScanOnlyAdminPath,
  isScanOnlyApiPath,
  isScanOnlyUser,
  normalizeScanOnlyForRole,
  resolvePostLoginPath,
  SCAN_ONLY_HOME,
} from "../src/lib/auth/scanOnlyAccess";

describe("scanOnlyAccess", () => {
  it("autorise scanner, profil et déconnexion", () => {
    assert.equal(isScanOnlyAdminPath("/admin/scanner"), true);
    assert.equal(isScanOnlyAdminPath("/admin/profil"), true);
    assert.equal(isScanOnlyAdminPath("/admin/signout"), true);
    assert.equal(isScanOnlyAdminPath("/admin/dashboard"), false);
    assert.equal(isScanOnlyAdminPath("/admin/players"), false);
    assert.equal(isScanOnlyAdminPath("/admin/players/abc"), false);
  });

  it("autorise les API scanner, session et mot de passe", () => {
    assert.equal(isScanOnlyApiPath("/api/qr/abc-token"), true);
    assert.equal(isScanOnlyApiPath("/api/users/me"), true);
    assert.equal(isScanOnlyApiPath("/api/users/me/password"), true);
    assert.equal(isScanOnlyApiPath("/api/auth/session"), true);
    assert.equal(isScanOnlyApiPath("/api/players"), false);
    assert.equal(isScanOnlyApiPath("/api/users"), false);
    assert.equal(isScanOnlyApiPath("/api/users/other-id"), false);
  });

  it("réserve scanOnly aux gestionnaires", () => {
    assert.equal(normalizeScanOnlyForRole("MANAGER", true), true);
    assert.equal(normalizeScanOnlyForRole("MANAGER", false), false);
    assert.equal(normalizeScanOnlyForRole("MANAGER", undefined), false);
    assert.equal(normalizeScanOnlyForRole("ADMIN", true), false);
    assert.equal(normalizeScanOnlyForRole("SUPER_ADMIN", true), false);
  });

  it("détecte isScanOnlyUser", () => {
    assert.equal(isScanOnlyUser({ scanOnly: true }), true);
    assert.equal(isScanOnlyUser({ scanOnly: false }), false);
    assert.equal(isScanOnlyUser(null), false);
    assert.equal(isScanOnlyUser(undefined), false);
  });

  it("redirige vers le scanner après connexion", () => {
    assert.equal(
      resolvePostLoginPath(true, "/admin/dashboard", "/admin/dashboard"),
      SCAN_ONLY_HOME,
    );
    assert.equal(
      resolvePostLoginPath(false, "/admin/players", "/admin/dashboard"),
      "/admin/players",
    );
    assert.equal(
      resolvePostLoginPath(false, "", "/admin/dashboard"),
      "/admin/dashboard",
    );
  });
});

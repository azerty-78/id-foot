import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMobileNavItems, getSidebarNavForUser } from "@/lib/adminNav";

describe("getMobileNavItems", () => {
  it("retourne 5 entrées pour MANAGER sans Compétitions", () => {
    const items = getMobileNavItems("MANAGER");
    assert.equal(items.length, 5);
    assert.ok(!items.some((item) => item.href === "/admin/competitions"));
    assert.ok(items.some((item) => item.href === "/admin/profil"));
  });

  it("limite à 5 entrées pour ADMIN en retirant Compétitions", () => {
    const items = getMobileNavItems("ADMIN");
    assert.equal(items.length, 5);
    assert.ok(!items.some((item) => item.href === "/admin/competitions"));
  });

  it("retourne scanner + profil pour scanOnly", () => {
    const items = getMobileNavItems("MANAGER", true);
    assert.equal(items.length, 2);
    assert.deepEqual(
      items.map((item) => item.href),
      ["/admin/scanner", "/admin/profil"],
    );
  });
});

describe("getSidebarNavForUser", () => {
  it("réduit la sidebar pour scanOnly", () => {
    const nav = getSidebarNavForUser("MANAGER", true);
    assert.equal(nav.scanOnlyMode, true);
    assert.equal(nav.main.length, 0);
    assert.equal(nav.tools.length, 2);
    assert.deepEqual(
      nav.tools.map((item) => item.href),
      ["/admin/scanner", "/admin/profil"],
    );
  });

  it("conserve la navigation complète pour un admin", () => {
    const nav = getSidebarNavForUser("ADMIN", false);
    assert.equal(nav.scanOnlyMode, false);
    assert.ok(nav.main.length >= 3);
    assert.ok(nav.tools.some((item) => item.href === "/admin/scanner"));
  });
});

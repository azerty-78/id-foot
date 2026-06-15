import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMobileNavItems } from "@/lib/adminNav";

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
});

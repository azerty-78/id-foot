import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canManageCompetitionUsers,
  isManageableManager,
  scanOnlyLabel,
  sortCompetitionUsers,
} from "../src/lib/auth/users";

const adminUser = {
  id: "admin-1",
  name: "Admin",
  email: "admin@test.com",
  role: "ADMIN" as const,
  competitionId: "comp-1",
  scanOnly: false,
};

const scanManager = {
  id: "mgr-1",
  nom: "Zoe Scan",
  email: "zoe@test.com",
  role: "MANAGER" as const,
  active: true,
  scanOnly: true,
  competitionId: "comp-1",
  createdAt: new Date("2026-01-01"),
};

const fullManager = {
  ...scanManager,
  id: "mgr-2",
  nom: "Alice Full",
  scanOnly: false,
};

describe("auth/users scanOnly", () => {
  it("expose le libellé scanOnly", () => {
    assert.equal(scanOnlyLabel(true), "Scan uniquement");
    assert.equal(scanOnlyLabel(false), null);
  });

  it("canManageCompetitionUsers ignore scanOnly sur l'admin", () => {
    assert.equal(canManageCompetitionUsers(adminUser), true);
    assert.equal(
      canManageCompetitionUsers({ ...adminUser, scanOnly: true }),
      true,
    );
  });

  it("isManageableManager cible les gestionnaires de la compétition", () => {
    assert.equal(isManageableManager(scanManager, adminUser), true);
    assert.equal(
      isManageableManager(
        { ...scanManager, competitionId: "other" },
        adminUser,
      ),
      false,
    );
    assert.equal(
      isManageableManager({ ...scanManager, role: "ADMIN" }, adminUser),
      false,
    );
  });

  it("sortCompetitionUsers préserve scanOnly dans la liste", () => {
    const sorted = sortCompetitionUsers([scanManager, fullManager]);
    assert.equal(sorted.length, 2);
    assert.ok(sorted.some((u) => u.scanOnly));
    assert.ok(sorted.some((u) => !u.scanOnly));
  });
});

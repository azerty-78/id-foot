import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateAdminPasswordReset,
  validateManagerUser,
  validateManagerUserUpdate,
  validatePasswordChange,
  validateUserNom,
} from "@/lib/validators";

describe("validateUserNom", () => {
  it("accepte un nom valide", () => {
    const result = validateUserNom({ nom: "Jean Dupont" });
    assert.equal(result.valid, true);
  });

  it("refuse un nom trop court", () => {
    const result = validateUserNom({ nom: "A" });
    assert.equal(result.valid, false);
  });
});

describe("validatePasswordChange", () => {
  it("accepte un changement valide", () => {
    const result = validatePasswordChange({
      currentPassword: "old-pass",
      newPassword: "new-pass-1",
      confirmPassword: "new-pass-1",
    });
    assert.equal(result.valid, true);
  });

  it("refuse si confirmation différente", () => {
    const result = validatePasswordChange({
      currentPassword: "old-pass",
      newPassword: "new-pass-1",
      confirmPassword: "other-pass",
    });
    assert.equal(result.valid, false);
  });
});

describe("validateManagerUser", () => {
  it("accepte un gestionnaire valide", () => {
    const result = validateManagerUser({
      nom: "Manager Test",
      email: "manager@test.com",
      password: "password1",
      confirmPassword: "password1",
    });
    assert.equal(result.valid, true);
  });

  it("accepte scanOnly optionnel", () => {
    assert.equal(
      validateManagerUser({
        nom: "Contrôleur",
        email: "scan@test.com",
        password: "password1",
        confirmPassword: "password1",
        scanOnly: true,
      }).valid,
      true,
    );
    assert.equal(
      validateManagerUser({
        nom: "Contrôleur",
        email: "scan@test.com",
        password: "password1",
        confirmPassword: "password1",
        scanOnly: false,
      }).valid,
      true,
    );
  });

  it("refuse scanOnly non booléen", () => {
    const result = validateManagerUser({
      nom: "Contrôleur",
      email: "scan@test.com",
      password: "password1",
      confirmPassword: "password1",
      scanOnly: "oui",
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("scanOnly")));
  });
});

describe("validateManagerUserUpdate", () => {
  it("accepte une mise à jour valide", () => {
    const result = validateManagerUserUpdate({
      nom: "Manager Test",
      email: "manager@test.com",
    });
    assert.equal(result.valid, true);
  });

  it("accepte la mise à jour de scanOnly", () => {
    const result = validateManagerUserUpdate({
      nom: "Manager Test",
      email: "manager@test.com",
      scanOnly: true,
    });
    assert.equal(result.valid, true);
  });

  it("refuse scanOnly non booléen", () => {
    const result = validateManagerUserUpdate({
      nom: "Manager Test",
      email: "manager@test.com",
      scanOnly: 1,
    });
    assert.equal(result.valid, false);
  });
});

describe("validateAdminPasswordReset", () => {
  it("accepte une réinitialisation valide", () => {
    const result = validateAdminPasswordReset({
      newPassword: "password1",
      confirmPassword: "password1",
    });
    assert.equal(result.valid, true);
  });
});

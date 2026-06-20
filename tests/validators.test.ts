import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateAdminPasswordReset,
  validateJoueur,
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

describe("validateJoueur", () => {
  const baseJoueur = {
    nom: "Dupont",
    prenom: "Jean",
    equipeId: "550e8400-e29b-41d4-a716-446655440000",
    sexe: "Masculin",
    photo: "/uploads/photos/test.jpg",
  };

  it("accepte un joueur valide", () => {
    const result = validateJoueur(baseJoueur);
    assert.equal(result.valid, true);
  });

  it("accepte un personnel valide", () => {
    const result = validateJoueur({
      ...baseJoueur,
      licenseType: "PERSONNEL",
      fonctionPersonnel: "Coach",
    });
    assert.equal(result.valid, true);
  });

  it("refuse un personnel sans fonction", () => {
    const result = validateJoueur({
      ...baseJoueur,
      licenseType: "PERSONNEL",
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("fonction")));
  });

  it("refuse un numéro de maillot pour le personnel", () => {
    const result = validateJoueur({
      ...baseJoueur,
      licenseType: "PERSONNEL",
      fonctionPersonnel: "Coach",
      numero: 10,
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

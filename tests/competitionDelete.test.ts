import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deleteCompetitionCascade,
  getCompetitionDeleteImpact,
} from "@/lib/competitionDelete";

describe("getCompetitionDeleteImpact", () => {
  it("agrège les compteurs attendus", async () => {
    const prisma = {
      equipe: {
        findMany: async () => [{ id: "e1" }, { id: "e2" }],
      },
      joueur: {
        count: async () => 5,
      },
      user: {
        count: async () => 3,
      },
    };

    const impact = await getCompetitionDeleteImpact(
      prisma as never,
      "comp-1",
    );

    assert.deepEqual(impact, { joueurs: 5, equipes: 2, users: 3 });
  });
});

describe("deleteCompetitionCascade", () => {
  it("supprime dans le bon ordre", async () => {
    const calls: string[] = [];

    const tx = {
      equipe: {
        findMany: async () => [{ id: "e1" }],
        deleteMany: async () => {
          calls.push("equipes");
          return { count: 1 };
        },
      },
      joueur: {
        deleteMany: async () => {
          calls.push("joueurs");
          return { count: 2 };
        },
      },
      user: {
        deleteMany: async () => {
          calls.push("users");
          return { count: 1 };
        },
      },
      competition: {
        delete: async () => {
          calls.push("competition");
          return {};
        },
      },
    };

    const result = await deleteCompetitionCascade(tx as never, "comp-1");

    assert.deepEqual(calls, ["joueurs", "equipes", "users", "competition"]);
    assert.deepEqual(result, { joueurs: 2, equipes: 1, users: 1 });
  });
});

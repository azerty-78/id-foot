import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  assertRole,
  isAuthResponse,
  requireApiUser,
} from "@/lib/auth/api";
import {
  canManageCompetitionUsers,
  isManageableManager,
  userPublicSelect,
} from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const denied = assertRole(user, "ADMIN");
    if (denied) return denied;

    if (!canManageCompetitionUsers(user)) {
      return jsonError("Compétition requise pour gérer les utilisateurs.", 403);
    }

    const { id } = await context.params;

    if (id === user.id) {
      return jsonError("Vous ne pouvez pas désactiver votre propre compte.", 400);
    }

    let body: { active?: boolean };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    if (typeof body.active !== "boolean") {
      return jsonError("Le statut actif est requis.", 400);
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

    if (!target || !isManageableManager(target, user)) {
      return jsonError("Gestionnaire introuvable.", 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active: body.active },
      select: userPublicSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

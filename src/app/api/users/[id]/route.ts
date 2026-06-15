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
import { validateManagerUserUpdate } from "@/lib/validators";

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

    let body: { nom?: string; email?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    const validation = validateManagerUserUpdate(body);
    if (!validation.valid) {
      return jsonError(validation.errors[0], 400);
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

    if (!target || !isManageableManager(target, user)) {
      return jsonError("Gestionnaire introuvable.", 404);
    }

    const email = body.email!.trim().toLowerCase();
    if (email !== target.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return jsonError("Un compte existe déjà avec cet email.", 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        nom: body.nom!.trim(),
        email,
      },
      select: userPublicSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
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
      return jsonError("Vous ne pouvez pas supprimer votre propre compte.", 400);
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

    if (!target || !isManageableManager(target, user)) {
      return jsonError("Gestionnaire introuvable.", 404);
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

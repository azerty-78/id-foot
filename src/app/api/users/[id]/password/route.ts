import bcrypt from "bcryptjs";
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
import { validateAdminPasswordReset } from "@/lib/validators";

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

    let body: { newPassword?: string; confirmPassword?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    const validation = validateAdminPasswordReset(body);
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

    const passwordHash = await bcrypt.hash(body.newPassword!, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

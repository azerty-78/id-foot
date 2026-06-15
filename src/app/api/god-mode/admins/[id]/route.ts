import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  adminUserSelect,
  isGodModeResponse,
  isManageableAdmin,
  requireGodModeSession,
} from "@/lib/god-mode/auth";
import { prisma } from "@/lib/prisma";
import { validateManagerUserUpdate } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

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
      select: adminUserSelect,
    });

    if (!target || !isManageableAdmin(target)) {
      return jsonError("Administrateur introuvable.", 404);
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
      select: adminUserSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

    const { id } = await context.params;

    if (id === session.sub) {
      return jsonError("Impossible de supprimer le compte god-mode.", 400);
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: adminUserSelect,
    });

    if (!target || !isManageableAdmin(target)) {
      return jsonError("Administrateur introuvable.", 404);
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

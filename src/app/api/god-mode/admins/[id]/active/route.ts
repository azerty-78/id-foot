import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  adminUserSelect,
  isGodModeResponse,
  isManageableAdmin,
  requireGodModeSession,
} from "@/lib/god-mode/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

    const { id } = await context.params;

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
      select: adminUserSelect,
    });

    if (!target || !isManageableAdmin(target)) {
      return jsonError("Administrateur introuvable.", 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active: body.active },
      select: adminUserSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

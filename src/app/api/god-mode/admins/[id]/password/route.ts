import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  adminUserSelect,
  isGodModeResponse,
  isManageableAdmin,
  requireGodModeSession,
} from "@/lib/god-mode/auth";
import { prisma } from "@/lib/prisma";
import { validateAdminPasswordReset } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

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
      select: adminUserSelect,
    });

    if (!target || !isManageableAdmin(target)) {
      return jsonError("Administrateur introuvable.", 404);
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

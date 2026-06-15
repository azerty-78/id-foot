import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import { isAuthResponse, requireApiUser } from "@/lib/auth/api";
import { prisma } from "@/lib/prisma";
import { validatePasswordChange } from "@/lib/validators";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    let body: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    const validation = validatePasswordChange(body);
    if (!validation.valid) {
      return jsonError(validation.errors[0], 400);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser) {
      return jsonError("Utilisateur introuvable.", 404);
    }

    const currentValid = await bcrypt.compare(
      body.currentPassword!,
      dbUser.passwordHash,
    );
    if (!currentValid) {
      return jsonError("Mot de passe actuel incorrect.", 400);
    }

    const passwordHash = await bcrypt.hash(body.newPassword!, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

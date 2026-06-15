import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  assertRole,
  isAuthResponse,
  requireApiUser,
} from "@/lib/auth/api";
import { userPublicSelect } from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";
import { validateUserNom } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: userPublicSelect,
    });

    if (!dbUser) {
      return jsonError("Utilisateur introuvable.", 404);
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    let body: { nom?: string };
    try {
      body = (await req.json()) as { nom?: string };
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    const validation = validateUserNom(body);
    if (!validation.valid) {
      return jsonError(validation.errors[0], 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { nom: body.nom!.trim() },
      select: userPublicSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

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
  userPublicSelect,
} from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";
import { validateManagerUser } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const denied = assertRole(user, "ADMIN");
    if (denied) return denied;

    if (!canManageCompetitionUsers(user)) {
      return jsonError("Compétition requise pour gérer les utilisateurs.", 403);
    }

    const users = await prisma.user.findMany({
      where: { competitionId: user.competitionId! },
      select: userPublicSelect,
      orderBy: [{ role: "asc" }, { nom: "asc" }],
    });

    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const denied = assertRole(user, "ADMIN");
    if (denied) return denied;

    if (!canManageCompetitionUsers(user)) {
      return jsonError("Compétition requise pour gérer les utilisateurs.", 403);
    }

    let body: {
      nom?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    const validation = validateManagerUser(body);
    if (!validation.valid) {
      return jsonError(validation.errors[0], 400);
    }

    const email = body.email!.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Un compte existe déjà avec cet email.", 409);
    }

    const passwordHash = await bcrypt.hash(body.password!, 12);
    const created = await prisma.user.create({
      data: {
        nom: body.nom!.trim(),
        email,
        passwordHash,
        role: "MANAGER",
        active: true,
        competitionId: user.competitionId!,
      },
      select: userPublicSelect,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

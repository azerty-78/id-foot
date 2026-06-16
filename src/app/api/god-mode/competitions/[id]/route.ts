import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  deleteCompetitionCascade,
  getCompetitionDeleteImpact,
} from "@/lib/competitionDelete";
import {
  isGodModeResponse,
  requireGodModeSession,
} from "@/lib/god-mode/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

    const { id } = await context.params;

    const competition = await prisma.competition.findUnique({
      where: { id },
      select: { id: true, nom: true, slug: true, abbreviation: true },
    });

    if (!competition) {
      return jsonError("Compétition introuvable.", 404);
    }

    const impact = await getCompetitionDeleteImpact(prisma, id);

    return NextResponse.json({ competition, impact });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

    const { id } = await context.params;

    const existing = await prisma.competition.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });

    if (!existing) {
      return jsonError("Compétition introuvable.", 404);
    }

    const deleted = await prisma.$transaction(async (tx) =>
      deleteCompetitionCascade(tx, id),
    );

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return handlePrismaError(error);
  }
}

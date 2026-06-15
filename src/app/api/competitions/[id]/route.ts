import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  assertRole,
  denyUnlessCompetitionAccess,
  isAuthResponse,
  requireApiUser,
} from "@/lib/auth/api";
import {
  ensureUniqueCompetitionSlug,
  slugifyCompetitionName,
} from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateCompetitionBody = {
  nom: string;
  annee: number | string;
  lieu?: string | null;
  image?: string | null;
};

function parseCompetitionPayload(body: UpdateCompetitionBody) {
  const nom = body.nom?.trim() ?? "";
  const annee = Number.parseInt(String(body.annee), 10);
  const lieu = body.lieu?.trim() || null;
  const image = body.image?.trim() || null;

  return { nom, annee, lieu, image };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        _count: { select: { equipes: true } },
        equipes: true,
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Compétition introuvable" },
        { status: 404 },
      );
    }

    const denied = denyUnlessCompetitionAccess(user, competition.id);
    if (denied) return denied;

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const roleDenied = assertRole(user, "ADMIN", "SUPER_ADMIN");
    if (roleDenied) return roleDenied;

    const { id } = await params;
    const body = (await req.json()) as UpdateCompetitionBody;
    const { nom, annee, lieu, image } = parseCompetitionPayload(body);

    if (!nom || Number.isNaN(annee)) {
      return NextResponse.json(
        { error: "Nom et année requis." },
        { status: 400 },
      );
    }

    const existing = await prisma.competition.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Compétition introuvable." },
        { status: 404 },
      );
    }

    const denied = denyUnlessCompetitionAccess(user, existing.id);
    if (denied) return denied;

    const baseSlug = slugifyCompetitionName(nom);
    const slug =
      existing.nom.trim() === nom.trim()
        ? existing.slug
        : await ensureUniqueCompetitionSlug(prisma, baseSlug, id);

    const competition = await prisma.competition.update({
      where: { id },
      data: {
        nom,
        slug,
        annee,
        lieu,
        image,
      },
      include: {
        _count: { select: { equipes: true } },
      },
    });

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const roleDenied = assertRole(user, "ADMIN", "SUPER_ADMIN");
    if (roleDenied) return roleDenied;

    const { id } = await params;

    const existing = await prisma.competition.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });

    if (!existing) {
      return jsonError("Compétition introuvable.", 404);
    }

    const denied = denyUnlessCompetitionAccess(user, id);
    if (denied) return denied;

    const equipes = await prisma.equipe.findMany({
      where: { competitionId: id },
      select: { id: true },
    });
    const equipeIds = equipes.map((equipe) => equipe.id);

    const deleted = await prisma.$transaction(async (tx) => {
      const joueurs =
        equipeIds.length > 0
          ? await tx.joueur.deleteMany({
              where: { equipeId: { in: equipeIds } },
            })
          : { count: 0 };

      const equipesDeleted = await tx.equipe.deleteMany({
        where: { competitionId: id },
      });

      const users = await tx.user.deleteMany({
        where: { competitionId: id },
      });

      await tx.competition.delete({ where: { id } });

      return {
        joueurs: joueurs.count,
        equipes: equipesDeleted.count,
        users: users.count,
      };
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return handlePrismaError(error);
  }
}

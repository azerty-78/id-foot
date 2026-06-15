import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/api/http";
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

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
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
    const { id } = await params;
    await prisma.competition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/api/http";
import { getAuthUser } from "@/lib/auth/server";
import {
  canAccessCompetition,
  competitionWhereForScope,
  getCompetitionScope,
} from "@/lib/auth/scope";
import {
  ensureUniqueCompetitionSlug,
  slugifyCompetitionName,
} from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";

type CreateCompetitionBody = {
  nom: string;
  annee: number | string;
  lieu?: string | null;
  image?: string | null;
};

function parseCompetitionPayload(body: CreateCompetitionBody) {
  const nom = body.nom?.trim() ?? "";
  const annee = Number.parseInt(String(body.annee), 10);
  const lieu = body.lieu?.trim() || null;
  const image = body.image?.trim() || null;

  return { nom, annee, lieu, image };
}

export async function GET() {
  try {
    const user = await getAuthUser();
    const scope = getCompetitionScope(user);

    const competitions = await prisma.competition.findMany({
      where: competitionWhereForScope(scope),
      include: {
        _count: { select: { equipes: true } },
      },
      orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(competitions);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateCompetitionBody;
    const { nom, annee, lieu, image } = parseCompetitionPayload(body);

    if (!nom || Number.isNaN(annee)) {
      return NextResponse.json(
        { error: "Nom et année requis." },
        { status: 400 },
      );
    }

    const baseSlug = slugifyCompetitionName(nom);
    const slug = await ensureUniqueCompetitionSlug(prisma, baseSlug);

    const competition = await prisma.competition.create({
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

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

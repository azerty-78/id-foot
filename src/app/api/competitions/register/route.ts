import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  ensureUniqueCompetitionSlug,
  slugifyCompetitionName,
} from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";
import { validateCompetition, validateCompetitionOwner } from "@/lib/validators";

export const runtime = "nodejs";

type RegisterCompetitionBody = {
  nom: string;
  annee: number | string;
  lieu?: string | null;
  image?: string | null;
  owner: {
    nom: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    let body: RegisterCompetitionBody;
    try {
      body = (await req.json()) as RegisterCompetitionBody;
    } catch {
      return jsonError("Corps de requête JSON invalide.", 400);
    }

    if (!body?.owner) {
      return jsonError("Informations du propriétaire requises.", 400);
    }

    const nom = body.nom?.trim() ?? "";
    const annee = Number.parseInt(String(body.annee), 10);
    const lieu = body.lieu?.trim() || null;
    const image = body.image?.trim() || null;

    const competitionValidation = validateCompetition({ nom, annee, lieu });
    if (!competitionValidation.valid) {
      return NextResponse.json(
        { error: competitionValidation.errors[0] },
        { status: 400 },
      );
    }

    const ownerValidation = validateCompetitionOwner(body.owner);
    if (!ownerValidation.valid) {
      return NextResponse.json(
        { error: ownerValidation.errors[0] },
        { status: 400 },
      );
    }

    const ownerEmail = body.owner.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 },
      );
    }

    const baseSlug = slugifyCompetitionName(nom);
    const slug = await ensureUniqueCompetitionSlug(prisma, baseSlug);
    const passwordHash = await bcrypt.hash(body.owner.password, 12);

    const competition = await prisma.$transaction(async (tx) => {
      const created = await tx.competition.create({
        data: {
          nom,
          slug,
          annee,
          lieu,
          image,
        },
      });

      await tx.user.create({
        data: {
          nom: body.owner.nom.trim(),
          email: ownerEmail,
          passwordHash,
          role: "ADMIN",
          competitionId: created.id,
        },
      });

      return created;
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

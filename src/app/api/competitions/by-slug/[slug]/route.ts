import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const competition = await prisma.competition.findUnique({
      where: { slug },
      include: {
        _count: { select: { equipes: true } },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Compétition introuvable." },
        { status: 404 },
      );
    }

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

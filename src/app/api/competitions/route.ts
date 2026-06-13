import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { annee: "desc" },
    });

    return NextResponse.json(competitions);
  } catch (error) {
    return handlePrismaError(error);
  }
}

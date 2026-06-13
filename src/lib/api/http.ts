import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      return jsonError("Référence invalide (équipe introuvable).", 400);
    }
    if (error.code === "P2002") {
      return jsonError("Cette valeur existe déjà.", 409);
    }
  }

  console.error(error);
  return jsonError("Erreur serveur.", 500);
}

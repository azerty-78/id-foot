import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "ECONNREFUSED";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("econnrefused") ||
      message.includes("connect") ||
      message.includes("connection terminated")
    );
  }

  return false;
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

  if (isDbConnectionError(error)) {
    console.error("[db] PostgreSQL inaccessible :", error);
    return jsonError(
      "Base de données inaccessible. Lancez PostgreSQL (npm run docker:up).",
      503,
    );
  }

  console.error(error);
  return jsonError("Erreur serveur.", 500);
}

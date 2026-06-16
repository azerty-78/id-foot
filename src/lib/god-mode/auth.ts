import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { getGodModeConfig } from "@/lib/god-mode/config";
import type { GodModeSession } from "@/lib/god-mode/session";
import { getGodModeSession } from "@/lib/god-mode/session";
import { prisma } from "@/lib/prisma";
import type { PublicUser } from "@/lib/auth/users";
import { userPublicSelect } from "@/lib/auth/users";

export async function ensureGodModeUser() {
  const config = getGodModeConfig();
  if (!config) {
    throw new Error("God mode non configuré.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: config.email },
    select: { passwordHash: true },
  });

  if (existing) {
    const passwordMatches = await bcrypt.compare(
      config.password,
      existing.passwordHash,
    );
    if (!passwordMatches) {
      const updatedHash = await bcrypt.hash(config.password, 12);
      await prisma.user.update({
        where: { email: config.email },
        data: {
          nom: config.name,
          passwordHash: updatedHash,
          role: "SUPER_ADMIN",
          active: true,
        },
      });
      return;
    }

    await prisma.user.update({
      where: { email: config.email },
      data: {
        nom: config.name,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
    return;
  }

  await prisma.user.create({
    data: {
      nom: config.name,
      email: config.email,
      passwordHash: await bcrypt.hash(config.password, 12),
      role: "SUPER_ADMIN",
      active: true,
      competitionId: null,
    },
  });
}

export async function authenticateGodMode(
  email: string,
  password: string,
): Promise<GodModeSession | null> {
  const config = getGodModeConfig();
  if (!config) return null;

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== config.email) {
    return null;
  }

  await ensureGodModeUser();

  const user = await prisma.user.findUnique({
    where: { email: config.email },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      active: true,
      passwordHash: true,
    },
  });

  if (!user || user.role !== "SUPER_ADMIN" || !user.active) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return {
    sub: user.id,
    email: user.email,
    name: user.nom,
    exp: 0,
  };
}

export async function getValidatedGodModeSession(): Promise<GodModeSession | null> {
  const session = await getGodModeSession();
  if (!session) return null;

  const config = getGodModeConfig();
  if (!config || session.email !== config.email) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, nom: true, email: true, role: true, active: true },
  });

  if (
    !user ||
    user.role !== "SUPER_ADMIN" ||
    !user.active ||
    user.email !== config.email
  ) {
    return null;
  }

  return {
    sub: user.id,
    email: user.email,
    name: user.nom,
    exp: session.exp,
  };
}

export type GodModeResult = GodModeSession | NextResponse;

export function isGodModeResponse(value: GodModeResult): value is NextResponse {
  return value instanceof NextResponse;
}

export async function requireGodModeSession(): Promise<GodModeResult> {
  const session = await getGodModeSession();
  if (!session) {
    return jsonError("Session god-mode requise.", 401);
  }

  const config = getGodModeConfig();
  if (!config || session.email !== config.email) {
    return jsonError("Session god-mode invalide.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true, active: true, email: true },
  });

  if (
    !user ||
    user.role !== "SUPER_ADMIN" ||
    !user.active ||
    user.email !== config.email
  ) {
    return jsonError("Accès god-mode refusé.", 403);
  }

  return session;
}

export const adminUserSelect = {
  ...userPublicSelect,
  competition: {
    select: {
      id: true,
      nom: true,
      slug: true,
      abbreviation: true,
      annee: true,
    },
  },
} as const;

export type GodModeAdminUser = PublicUser & {
  competition: {
    id: string;
    nom: string;
    slug: string;
    abbreviation: string;
    annee: number;
  } | null;
};

export function isManageableAdmin(
  target: Pick<PublicUser, "role" | "email">,
): boolean {
  const config = getGodModeConfig();
  if (!config) return false;

  return target.role === "ADMIN" && target.email !== config.email;
}

export function isProtectedGodAccount(email: string): boolean {
  const config = getGodModeConfig();
  return config?.email === email.trim().toLowerCase();
}

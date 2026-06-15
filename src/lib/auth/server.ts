import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth/scope";
import { prisma } from "@/lib/prisma";

const authUserSelect = {
  id: true,
  nom: true,
  email: true,
  role: true,
  competitionId: true,
  active: true,
} as const;

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: authUserSelect,
  });

  if (!dbUser?.active) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.nom,
    email: dbUser.email,
    role: dbUser.role,
    competitionId: dbUser.competitionId,
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

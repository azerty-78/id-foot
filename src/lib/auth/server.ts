import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth/scope";

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    role: user.role,
    competitionId: user.competitionId ?? null,
  };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

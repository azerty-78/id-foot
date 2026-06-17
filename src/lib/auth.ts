import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { normalizeScanOnlyForRole } from "@/lib/auth/scanOnlyAccess";
import { AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/sessionPolicy";
import { prisma } from "@/lib/prisma";

const userSessionSelect = {
  id: true,
  nom: true,
  email: true,
  role: true,
  competitionId: true,
  active: true,
  scanOnly: true,
  sessionVersion: true,
} as const;

async function bumpUserSessionVersion(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
    select: userSessionSelect,
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        competitionSlug: { label: "Compétition", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const competitionSlug = credentials?.competitionSlug?.trim();

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.active) {
          return null;
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
          return null;
        }

        if (competitionSlug && user.role !== "SUPER_ADMIN") {
          const competition = await prisma.competition.findUnique({
            where: { slug: competitionSlug },
            select: { id: true },
          });

          if (!competition || user.competitionId !== competition.id) {
            return null;
          }
        }

        const sessionUser = await bumpUserSessionVersion(user.id);

        return {
          id: sessionUser.id,
          name: sessionUser.nom,
          email: sessionUser.email,
          role: sessionUser.role,
          competitionId: sessionUser.competitionId,
          sessionVersion: sessionUser.sessionVersion,
          scanOnly: normalizeScanOnlyForRole(
            sessionUser.role,
            sessionUser.scanOnly,
          ),
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.competitionId = user.competitionId;
        token.sessionVersion = user.sessionVersion;
        token.scanOnly = user.scanOnly ?? false;
        token.active = true;
        token.userCheckedAt = Date.now();
        return token;
      }

      if (!token.sub) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: userSessionSelect,
      });

      if (
        !dbUser ||
        !dbUser.active ||
        dbUser.sessionVersion !== token.sessionVersion
      ) {
        token.active = false;
        delete token.sub;
        delete token.id;
        token.userCheckedAt = Date.now();
        return token;
      }

      const refreshIntervalMs = 60_000;
      const lastCheck = token.userCheckedAt ?? 0;
      const shouldRefresh =
        trigger === "update" || Date.now() - lastCheck > refreshIntervalMs;

      if (shouldRefresh) {
        token.active = true;
        token.name = dbUser.nom;
        token.email = dbUser.email;
        token.role = dbUser.role;
        token.competitionId = dbUser.competitionId;
        token.sessionVersion = dbUser.sessionVersion;
        token.scanOnly = normalizeScanOnlyForRole(dbUser.role, dbUser.scanOnly);
        token.userCheckedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const isActive = Boolean(token.sub && token.active !== false);

        if (!isActive) {
          session.user.active = false;
          return session;
        }

        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.competitionId =
          (token.competitionId as string | null | undefined) ?? null;
        session.user.scanOnly = token.scanOnly === true;
        session.user.active = true;
      }
      return session;
    },
  },
};

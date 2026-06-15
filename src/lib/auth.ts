import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

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

        if (!user) {
          return null;
        }

        if (!user.active) {
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

        return {
          id: user.id,
          name: user.nom,
          email: user.email,
          role: user.role,
          competitionId: user.competitionId,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/signin",
  },
  session: {
    strategy: "jwt",
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
        token.active = true;
        token.userCheckedAt = Date.now();
        return token;
      }

      if (!token.sub) {
        return token;
      }

      const refreshIntervalMs = 60_000;
      const lastCheck = token.userCheckedAt ?? 0;
      const shouldRefresh =
        trigger === "update" || Date.now() - lastCheck > refreshIntervalMs;

      if (!shouldRefresh) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: {
          nom: true,
          email: true,
          role: true,
          competitionId: true,
          active: true,
        },
      });

      token.userCheckedAt = Date.now();

      if (!dbUser) {
        token.active = false;
        delete token.sub;
        delete token.id;
        return token;
      }

      if (!dbUser.active) {
        token.active = false;
        delete token.sub;
        delete token.id;
        return token;
      }

      token.active = true;
      token.name = dbUser.nom;
      token.email = dbUser.email;
      token.role = dbUser.role;
      token.competitionId = dbUser.competitionId;
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
        session.user.active = true;
      }
      return session;
    },
  },
};

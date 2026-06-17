import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      competitionId: string | null;
      active: boolean;
      scanOnly: boolean;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    competitionId: string | null;
    sessionVersion: number;
    scanOnly?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    competitionId?: string | null;
    active?: boolean;
    userCheckedAt?: number;
    sessionVersion?: number;
    scanOnly?: boolean;
  }
}

export {};

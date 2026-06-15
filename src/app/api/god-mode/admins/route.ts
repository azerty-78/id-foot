import { NextResponse } from "next/server";
import { handlePrismaError } from "@/lib/api/http";
import {
  adminUserSelect,
  isGodModeResponse,
  requireGodModeSession,
} from "@/lib/god-mode/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGodModeSession();
    if (isGodModeResponse(session)) return session;

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: adminUserSelect,
      orderBy: [{ active: "desc" }, { nom: "asc" }],
    });

    const stats = {
      total: admins.length,
      active: admins.filter((admin) => admin.active).length,
      inactive: admins.filter((admin) => !admin.active).length,
    };

    return NextResponse.json({ admins, stats });
  } catch (error) {
    return handlePrismaError(error);
  }
}

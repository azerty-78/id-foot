import { NextRequest, NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  denyUnlessCompetitionAccess,
  isAuthResponse,
  requireApiUser,
} from "@/lib/auth/api";
import { buildQrScanPath } from "@/lib/qrScanUrl";
import { getPlayerByQrToken } from "@/lib/qrPlayer";

type RouteParams = {
  params: Promise<{ token: string }>;
};

function wantsHtmlRedirect(req: NextRequest): boolean {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("text/html") && !accept.includes("application/json");
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (wantsHtmlRedirect(req)) {
      return NextResponse.redirect(new URL(buildQrScanPath(token), req.url));
    }

    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const joueur = await getPlayerByQrToken(token);

    if (!joueur) {
      return NextResponse.json(
        { error: "Joueur introuvable", valid: false },
        { status: 404 },
      );
    }

    const denied = denyUnlessCompetitionAccess(
      user,
      joueur.equipe.competitionId,
    );
    if (denied) return denied;

    return NextResponse.json({ ...joueur, valid: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}

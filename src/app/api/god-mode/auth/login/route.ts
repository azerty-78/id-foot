import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { authenticateGodMode } from "@/lib/god-mode/auth";
import { getGodModeConfig, isGodModeConfigured } from "@/lib/god-mode/config";
import {
  attachGodModeCookie,
  createGodModeToken,
} from "@/lib/god-mode/session";

export async function POST(req: NextRequest) {
  if (!isGodModeConfigured()) {
    return jsonError("God mode non configuré sur ce serveur.", 503);
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonError("Corps de requête JSON invalide.", 400);
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return jsonError("Email et mot de passe requis.", 400);
  }

  const session = await authenticateGodMode(email, password);
  if (!session) {
    return jsonError("Identifiants god-mode invalides.", 401);
  }

  const token = createGodModeToken({
    sub: session.sub,
    email: session.email,
    name: session.name,
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
    },
  });

  return attachGodModeCookie(response, token);
}

export async function GET() {
  const config = getGodModeConfig();
  return NextResponse.json({
    configured: Boolean(config),
    emailHint: config ? config.email.replace(/(.{2}).+(@.+)/, "$1***$2") : null,
  });
}

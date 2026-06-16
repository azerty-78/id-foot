import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/sessionPolicy";
import { getGodModeConfig } from "@/lib/god-mode/config";

export const GOD_MODE_COOKIE = "id-foot-god-mode";

export type GodModeSession = {
  sub: string;
  email: string;
  name: string;
  sessionVersion: number;
  exp: number;
};

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createGodModeToken(session: Omit<GodModeSession, "exp">): string {
  const config = getGodModeConfig();
  if (!config) {
    throw new Error("God mode non configuré.");
  }

  const payload: GodModeSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + AUTH_SESSION_MAX_AGE_SECONDS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encoded, config.sessionSecret);
  return `${encoded}.${signature}`;
}

export function verifyGodModeToken(token: string | undefined): GodModeSession | null {
  const config = getGodModeConfig();
  if (!config || !token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = signPayload(encoded, config.sessionSecret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as GodModeSession;

    if (
      !payload.sub ||
      !payload.email ||
      payload.email !== config.email ||
      typeof payload.exp !== "number" ||
      typeof payload.sessionVersion !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getGodModeSession(): Promise<GodModeSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GOD_MODE_COOKIE)?.value;
  return verifyGodModeToken(token);
}

export function attachGodModeCookie(
  response: NextResponse,
  token: string,
): NextResponse {
  response.cookies.set({
    name: GOD_MODE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearGodModeCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: GOD_MODE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

import { NextResponse } from "next/server";
import { getGodModeSession } from "@/lib/god-mode/session";

export async function GET() {
  const session = await getGodModeSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
    },
  });
}

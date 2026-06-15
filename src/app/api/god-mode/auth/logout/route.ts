import { NextResponse } from "next/server";
import { clearGodModeCookie } from "@/lib/god-mode/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearGodModeCookie(response);
}

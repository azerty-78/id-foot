export type GodModeConfig = {
  email: string;
  password: string;
  name: string;
  sessionSecret: string;
};

export function getGodModeConfig(): GodModeConfig | null {
  const email = process.env.GOD_MODE_EMAIL?.trim().toLowerCase();
  const password = process.env.GOD_MODE_PASSWORD ?? "";
  const name = process.env.GOD_MODE_NAME?.trim() ?? "God Mod";
  const sessionSecret =
    process.env.GOD_MODE_SESSION_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";

  if (!email || !password || !sessionSecret) {
    return null;
  }

  return { email, password, name, sessionSecret };
}

export function isGodModeConfigured(): boolean {
  return getGodModeConfig() !== null;
}

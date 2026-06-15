import type { Metadata } from "next";
import { GodModeLogin } from "@/components/god-mode/GodModeLogin";
import { GodModePanel } from "@/components/god-mode/GodModePanel";
import {
  adminUserSelect,
} from "@/lib/god-mode/auth";
import { isGodModeConfigured } from "@/lib/god-mode/config";
import { getGodModeSession } from "@/lib/god-mode/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "God Mode",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function GodModePage() {
  if (!isGodModeConfigured()) {
    return (
      <div className="god-mode-shell">
        <div className="card-default mx-auto max-w-lg text-center">
          <h1 className="text-h1">God Mode indisponible</h1>
          <p className="text-body mt-3">
            Les variables d&apos;environnement god-mode ne sont pas configurées sur ce
            serveur.
          </p>
        </div>
      </div>
    );
  }

  const session = await getGodModeSession();

  if (!session) {
    return (
      <div className="god-mode-shell">
        <GodModeLogin />
      </div>
    );
  }

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

  return (
    <div className="god-mode-shell">
      <GodModePanel
        sessionUser={{
          id: session.sub,
          email: session.email,
          name: session.name,
        }}
        initialAdmins={admins}
        initialStats={stats}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ScanAccessDenied,
  ScanAuthGate,
  ScanPlayerResult,
} from "@/components/scan/ScanViews";
import { getAuthUser } from "@/lib/auth/server";
import { canAccessCompetition } from "@/lib/auth/scope";
import { getPlayerByQrToken } from "@/lib/qrPlayer";

export const dynamic = "force-dynamic";

type ScanPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Vérification licence",
  robots: { index: false, follow: false },
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { token } = await params;
  const user = await getAuthUser();

  if (!user) {
    return <ScanAuthGate token={token} />;
  }

  const player = await getPlayerByQrToken(token);
  if (!player) {
    notFound();
  }

  if (!canAccessCompetition(user, player.equipe.competitionId)) {
    return <ScanAccessDenied token={token} />;
  }

  return <ScanPlayerResult player={player} />;
}

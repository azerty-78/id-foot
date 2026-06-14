"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  AdminCard,
  GhostLink,
  LoadingState,
  PageHeader,
} from "@/components/admin/ui";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { usePlayer } from "@/hooks/useApi";

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { player, loading, error } = usePlayer(id);

  if (loading) {
    return <LoadingState message="Chargement du joueur..." />;
  }

  if (error || !player) {
    return (
      <AdminCard className="px-6 py-10 text-center">
        <p className="text-sm text-rose-700">{error ?? "Joueur introuvable."}</p>
        <GhostLink href="/admin/players" icon={ArrowLeft} className="mt-4 inline-flex">
          Retour à la liste
        </GhostLink>
      </AdminCard>
    );
  }

  return (
    <div>
      <PageHeader
        title="Modifier le joueur"
        description={`Mettre à jour les informations de ${player.prenom} ${player.nom}.`}
      />

      <PlayerForm
        mode="edit"
        playerId={id}
        initialPlayer={player}
        cancelHref={`/admin/players/${id}`}
        onSuccess={() => router.push(`/admin/players/${id}`)}
      />
    </div>
  );
}

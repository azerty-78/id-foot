"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { usePlayer } from "@/hooks/useApi";
import {
  AdminCard,
  DangerButton,
  GhostLink,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
} from "@/components/admin/ui";

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR");
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { player, loading, error } = usePlayer(id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  async function handleDownloadCard() {
    if (!player) return;

    try {
      const res = await fetch(`/api/players/${player.id}/card`);

      if (!res.ok) {
        throw new Error("Erreur lors du téléchargement de la carte.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carte-joueur-${player.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  async function handleDelete() {
    if (!player) return;

    const fullName = `${player.prenom} ${player.nom}`;

    if (!window.confirm(`Supprimer le joueur ${fullName} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la suppression.");
      }

      router.push("/admin/players");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du joueur..." />;
  }

  if (error || !player) {
    return (
      <AdminCard className="px-6 py-10 text-center">
        <p className="text-sm text-rose-700">{error ?? "Joueur introuvable."}</p>
        <GhostLink href="/admin/players" className="mt-4 inline-flex">
          Retour à la liste
        </GhostLink>
      </AdminCard>
    );
  }

  const qrValue = `${appUrl}/api/qr/${player.qrToken}`;

  const details = [
    { label: "ID", value: player.id },
    { label: "Prénom", value: player.prenom },
    { label: "Nom", value: player.nom },
    { label: "Date de naissance", value: formatDate(player.dateNaissance) },
    { label: "Nationalité", value: player.nationalite ?? "—" },
    { label: "Sexe", value: player.sexe ?? "—" },
    { label: "Téléphone", value: player.telephone ?? "—" },
    { label: "Numéro de maillot", value: String(player.numero) },
    { label: "Poste", value: player.poste },
    { label: "Photo", value: player.photo ?? "—" },
    { label: "QR Token", value: player.qrToken },
    { label: "Équipe", value: player.equipe.nom },
    { label: "Compétition", value: player.equipe.competition.nom },
    { label: "Année compétition", value: String(player.equipe.competition.annee) },
    { label: "Lieu compétition", value: player.equipe.competition.lieu ?? "—" },
    { label: "Créé le", value: formatDateTime(player.createdAt) },
    { label: "Mis à jour le", value: formatDateTime(player.updatedAt) },
  ];

  return (
    <div className="print:block">
      <div className="mb-6 print:hidden">
        <GhostLink href="/admin/players" className="px-0">
          ← Retour à la liste
        </GhostLink>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <AdminCard className="pitch-pattern overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-lg print:shadow-none">
          <div className="flex flex-col items-center text-center">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={`${player.prenom} ${player.nom}`}
                width={120}
                height={120}
                className="h-28 w-28 rounded-2xl border-4 border-white/20 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white/20 bg-white/10 text-3xl font-bold">
                {getInitials(player.prenom, player.nom)}
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold">
              {player.prenom} {player.nom}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-brand-dark">
                #{player.numero}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                {player.poste}
              </span>
            </div>

            <p className="mt-4 text-sm text-white/80">{player.equipe.nom}</p>
            <p className="text-sm text-white/60">
              {player.equipe.competition.nom} ({player.equipe.competition.annee})
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4 shadow-md">
              <QRCodeSVG value={qrValue} size={140} level="M" />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 print:hidden">
              <PrimaryButton
                type="button"
                onClick={handleDownloadCard}
                className="w-full bg-gold text-brand-dark hover:bg-brand-hover sm:w-auto"
              >
                Télécharger la carte PDF
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => window.print()}
                className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                Imprimer
              </SecondaryButton>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-6 print:shadow-none">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand/60">
                Fiche joueur
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Informations détaillées
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <SecondaryLink href={`/admin/players/${player.id}/edit`}>
                Modifier
              </SecondaryLink>
              <DangerButton type="button" onClick={handleDelete}>
                Supprimer
              </DangerButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <tbody className="divide-y divide-slate-100">
                {details.map((row) => (
                  <tr key={row.label} className="transition hover:bg-brand-light/30">
                    <th className="w-1/3 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-500">
                      {row.label}
                    </th>
                    <td className="break-all px-4 py-3 text-sm text-slate-900">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { usePlayer } from "@/hooks/useApi";

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
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-zinc-500">
        Chargement du joueur...
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
        <p className="text-sm text-rose-700">
          {error ?? "Joueur introuvable."}
        </p>
        <Link
          href="/admin/players"
          className="mt-4 inline-block text-sm font-medium text-[#1a472a] hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  const qrValue = `${appUrl}/api/qr/${player.qrToken}`;

  const details = [
    { label: "ID", value: player.id },
    { label: "Prénom", value: player.prenom },
    { label: "Nom", value: player.nom },
    { label: "Date de naissance", value: formatDate(player.dateNaissance) },
    { label: "Nationalité", value: player.nationalite ?? "—" },
    { label: "Sexe", value: player.sexe },
    { label: "Numéro", value: String(player.numero) },
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
        <Link
          href="/admin/players"
          className="text-sm font-medium text-[#1a472a] hover:underline"
        >
          ← Retour à la liste
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="rounded-xl bg-[#1a472a] p-6 text-white shadow-sm print:shadow-none">
          <div className="flex flex-col items-center text-center">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={`${player.prenom} ${player.nom}`}
                width={120}
                height={120}
                className="h-28 w-28 rounded-full border-4 border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-bold">
                {getInitials(player.prenom, player.nom)}
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold">
              {player.prenom} {player.nom}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-[#FFD700] px-3 py-1 text-sm font-bold text-[#1a472a]">
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

            <div className="mt-6 rounded-xl bg-white p-4">
              <QRCodeSVG value={qrValue} size={140} level="M" />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handleDownloadCard}
                className="rounded-lg bg-[#FFD700] px-4 py-2.5 text-sm font-semibold text-[#1a472a] transition hover:bg-[#e6c200]"
              >
                Télécharger la carte PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Imprimer
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm print:shadow-none">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Informations détaillées
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Fiche complète du joueur
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Link
                href={`/admin/players/${player.id}/edit`}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200">
              <tbody className="divide-y divide-zinc-100">
                {details.map((row) => (
                  <tr key={row.label}>
                    <th className="w-1/3 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-500">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-sm text-zinc-900 break-all">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlayers, useTeams, type Player } from "@/hooks/useApi";

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function PlayerAvatar({ player }: { player: Player }) {
  const initials = getInitials(player.prenom, player.nom);

  if (player.photo) {
    return (
      <Image
        src={player.photo}
        alt={`${player.prenom} ${player.nom}`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a472a] text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [equipeId, setEquipeId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const filters = useMemo(
    () => ({
      nom: debouncedSearch || undefined,
      equipeId: equipeId || undefined,
    }),
    [debouncedSearch, equipeId]
  );

  const { players, loading, error, refetch } = usePlayers(filters);
  const { teams, loading: teamsLoading } = useTeams();

  async function handleDownloadCard(id: string) {
    try {
      const res = await fetch(`/api/players/${id}/card`);

      if (!res.ok) {
        throw new Error("Erreur lors du téléchargement de la carte.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carte-joueur-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  async function handleDelete(player: Player) {
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

      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Joueurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestion des joueurs enregistrés
          </p>
        </div>
        <Link
          href="/admin/players/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#153d24]"
        >
          + Ajouter un joueur
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou prénom..."
          className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
        />
        <select
          value={equipeId}
          onChange={(e) => setEquipeId(e.target.value)}
          disabled={teamsLoading}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20 sm:min-w-56"
        >
          <option value="">Toutes les équipes</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.nom}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Nom complet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Numéro
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Poste
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Équipe
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Compétition
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    Aucun joueur trouvé.
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-zinc-50/80">
                    <td className="px-4 py-3">
                      <PlayerAvatar player={player} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                      {player.prenom} {player.nom}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#1a472a]/10 px-2.5 py-1 text-xs font-semibold text-[#1a472a]">
                        {player.numero}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {player.poste}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {player.equipe.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {player.equipe.competition.nom}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/players/${player.id}`}
                          className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Voir
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDownloadCard(player.id)}
                          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                        >
                          Carte PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(player)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

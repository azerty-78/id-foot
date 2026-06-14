"use client";

import { Download, Eye, Trash2, UserPlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  AdminCard,
  DangerButton,
  EmptyState,
  LoadingState,
  PageHeader,
  GhostLink,
  OutlineLink,
  PrimaryButton,
  PrimaryLink,
} from "@/components/admin/ui";
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
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white ring-2 ring-brand/20">
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
      <PageHeader
        title="Joueurs"
        description="Gestion des joueurs enregistrés et de leurs licences."
        action={
          <PrimaryLink href="/admin/players/new" icon={UserPlus} className="w-full sm:w-auto">
            Ajouter un joueur
          </PrimaryLink>
        }
      />

      <AdminCard className="mb-6 flex flex-col gap-4 p-4 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou prénom..."
          className="admin-input flex-1"
        />
        <select
          value={equipeId}
          onChange={(e) => setEquipeId(e.target.value)}
          disabled={teamsLoading}
          className="admin-input sm:min-w-56"
        >
          <option value="">Toutes les équipes</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.nom}
            </option>
          ))}
        </select>
      </AdminCard>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState message="Chargement des joueurs..." />
      ) : players.length === 0 ? (
        <EmptyState message="Aucun joueur trouvé pour ces critères." />
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {players.map((player) => (
              <AdminCard key={player.id} className="p-4">
                <div className="flex items-start gap-3">
                  <PlayerAvatar player={player} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {player.prenom} {player.nom}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {player.equipe.nom} · {player.equipe.competition.nom}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gold px-2.5 py-1 font-bold text-brand-dark">
                        #{player.numero}
                      </span>
                      <span className="rounded-full bg-brand-light px-2.5 py-1 font-medium text-brand">
                        {player.poste}
                      </span>
                    </div>
                    {player.telephone && (
                      <p className="mt-2 text-sm text-slate-600">{player.telephone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <GhostLink
                    href={`/admin/players/${player.id}`}
                    icon={Eye}
                    size="sm"
                    className="col-span-1 w-full"
                  >
                    Voir
                  </GhostLink>
                  <PrimaryButton
                    type="button"
                    icon={Download}
                    size="sm"
                    onClick={() => handleDownloadCard(player.id)}
                    className="w-full"
                  >
                    PDF
                  </PrimaryButton>
                  <DangerButton
                    type="button"
                    icon={Trash2}
                    size="sm"
                    onClick={() => handleDelete(player)}
                    className="col-span-2 w-full sm:col-span-1"
                  >
                    Supprimer
                  </DangerButton>
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Photo
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nom complet
                  </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Maillot
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Téléphone
                </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Poste
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Équipe
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compétition
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((player) => (
                  <tr key={player.id} className="transition hover:bg-brand-light/40">
                    <td className="px-5 py-4">
                      <PlayerAvatar player={player} />
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {player.prenom} {player.nom}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-brand-dark">
                        {player.numero}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {player.telephone ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {player.poste}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {player.equipe.nom}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {player.equipe.competition.nom}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <GhostLink
                          href={`/admin/players/${player.id}`}
                          icon={Eye}
                          size="sm"
                        >
                          Voir
                        </GhostLink>
                        <PrimaryButton
                          type="button"
                          icon={Download}
                          size="sm"
                          onClick={() => handleDownloadCard(player.id)}
                        >
                          PDF
                        </PrimaryButton>
                        <DangerButton
                          type="button"
                          icon={Trash2}
                          size="sm"
                          onClick={() => handleDelete(player)}
                        >
                          Supprimer
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
        </>
      )}
    </div>
  );
}

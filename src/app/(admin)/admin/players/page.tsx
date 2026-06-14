"use client";

import { CreditCard, Download, Eye, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlayerSectionNav } from "@/components/admin/PlayerSectionNav";
import {
  AdminCard,
  AdminTable,
  DangerButton,
  EmptyState,
  GhostLink,
  LoadingState,
  OutlineLink,
  PageToolbar,
  PlayerAvatar,
  PrimaryButton,
  PrimaryLink,
  StatusBadge,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { usePlayers, useTeams, type Player } from "@/hooks/useApi";

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
  const { showToast } = useToast();

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
      showToast("success", "Carte PDF téléchargée.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erreur inconnue");
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
      showToast("success", "Joueur supprimé.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div>
      <PageToolbar
        title="Joueurs"
        subtitle={
          loading
            ? "Chargement..."
            : `${players.length} licence${players.length !== 1 ? "s" : ""}`
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un joueur..."
        action={
          <div className="page-toolbar-actions">
            <OutlineLink href="/admin/players/cards" icon={CreditCard} size="sm">
              <span className="hidden sm:inline">Cartes licences</span>
              <span className="sm:hidden">Cartes</span>
            </OutlineLink>
            <PrimaryLink href="/admin/players/new" icon={UserPlus}>
              Nouveau
            </PrimaryLink>
          </div>
        }
      />

      <PlayerSectionNav />

      <AdminCard className="mb-6 p-4">
        <label htmlFor="equipe-filter" className="field-label">
          Filtrer par équipe
        </label>
        <select
          id="equipe-filter"
          value={equipeId}
          onChange={(e) => setEquipeId(e.target.value)}
          disabled={teamsLoading}
          className="admin-select sm:max-w-xs"
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
                  <PlayerAvatar
                    photo={player.photo}
                    prenom={player.prenom}
                    nom={player.nom}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {player.prenom} {player.nom}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {player.equipe.nom} · {player.equipe.competition.nom}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge tone="navy">#{player.numero}</StatusBadge>
                      <StatusBadge tone="navy">{player.poste}</StatusBadge>
                    </div>
                    {player.telephone && (
                      <p className="mt-2 text-sm text-slate-600">{player.telephone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <GhostLink
                    href={`/admin/players/${player.id}`}
                    icon={Eye}
                    size="icon"
                    aria-label={`Voir ${player.prenom} ${player.nom}`}
                  />
                  <PrimaryButton
                    type="button"
                    icon={Download}
                    size="icon"
                    aria-label="Télécharger PDF"
                    onClick={() => handleDownloadCard(player.id)}
                  />
                  <DangerButton
                    type="button"
                    icon={Trash2}
                    size="icon"
                    aria-label="Supprimer"
                    onClick={() => handleDelete(player)}
                  />
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-hidden p-0 lg:block">
            <AdminTable>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Nom complet</th>
                  <th>Maillot</th>
                  <th>Téléphone</th>
                  <th>Poste</th>
                  <th>Équipe</th>
                  <th>Compétition</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <PlayerAvatar
                    photo={player.photo}
                    prenom={player.prenom}
                    nom={player.nom}
                  />
                    </td>
                    <td className="font-medium">
                      {player.prenom} {player.nom}
                    </td>
                    <td>
                      <StatusBadge tone="navy">#{player.numero}</StatusBadge>
                    </td>
                    <td>{player.telephone ?? "—"}</td>
                    <td>
                      <StatusBadge tone="navy">{player.poste}</StatusBadge>
                    </td>
                    <td>{player.equipe.nom}</td>
                    <td>{player.equipe.competition.nom}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <GhostLink
                          href={`/admin/players/${player.id}`}
                          icon={Eye}
                          size="icon"
                          aria-label={`Voir ${player.prenom} ${player.nom}`}
                        />
                        <PrimaryButton
                          type="button"
                          icon={Download}
                          size="icon"
                          aria-label="Télécharger PDF"
                          onClick={() => handleDownloadCard(player.id)}
                        />
                        <DangerButton
                          type="button"
                          icon={Trash2}
                          size="icon"
                          aria-label="Supprimer"
                          onClick={() => handleDelete(player)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminCard>
        </>
      )}
    </div>
  );
}

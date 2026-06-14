"use client";

import { Download, FileDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlayerLicenseCard } from "@/components/admin/PlayerLicenseCard";
import {
  AdminCard,
  EmptyState,
  LoadingState,
  OutlineButton,
  PageToolbar,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { useCompetitions, usePlayers, useTeams } from "@/hooks/useApi";
import { downloadPdfFromApi } from "@/lib/downloadPdfClient";
import {
  buildCompetitionCardsFilename,
  buildPlayerCardFilename,
  buildTeamCardsFilename,
} from "@/lib/playerCardFilename";

export default function PlayerCardsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [competitionId, setCompetitionId] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
      competitionId: competitionId || undefined,
    }),
    [debouncedSearch, equipeId, competitionId],
  );

  const { players, loading, error } = usePlayers(filters);
  const { teams, loading: teamsLoading } = useTeams();
  const { competitions, loading: competitionsLoading } = useCompetitions();
  const { showToast } = useToast();

  const filteredTeams = useMemo(
    () =>
      competitionId
        ? teams.filter((team) => team.competitionId === competitionId)
        : teams,
    [teams, competitionId],
  );

  const selectedTeam = teams.find((team) => team.id === equipeId);
  const selectedCompetition = competitions.find(
    (competition) => competition.id === competitionId,
  );

  const bulkPdfQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (equipeId) params.set("equipeId", equipeId);
    else if (competitionId) params.set("competitionId", competitionId);
    if (debouncedSearch) params.set("nom", debouncedSearch);
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [equipeId, competitionId, debouncedSearch]);

  const bulkFallbackFilename = equipeId
    ? buildTeamCardsFilename(selectedTeam?.nom ?? "equipe")
    : competitionId
      ? buildCompetitionCardsFilename(selectedCompetition?.nom ?? "competition")
      : "cartes-licences.pdf";

  function handleCompetitionChange(nextCompetitionId: string) {
    setCompetitionId(nextCompetitionId);
    if (nextCompetitionId && equipeId) {
      const teamStillVisible = teams.some(
        (team) =>
          team.id === equipeId && team.competitionId === nextCompetitionId,
      );
      if (!teamStillVisible) {
        setEquipeId("");
      }
    }
  }

  async function handleBulkDownload() {
    setBulkDownloading(true);

    try {
      await downloadPdfFromApi(
        `/api/players/cards/pdf${bulkPdfQuery}`,
        bulkFallbackFilename,
      );
      showToast(
        "success",
        `${players.length} carte${players.length !== 1 ? "s" : ""} exportée${players.length !== 1 ? "s" : ""} en PDF.`,
      );
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBulkDownloading(false);
    }
  }

  async function handleSingleDownload(id: string) {
    const player = players.find((item) => item.id === id);
    setDownloadingId(id);

    try {
      await downloadPdfFromApi(
        `/api/players/${id}/card`,
        player
          ? buildPlayerCardFilename(player.prenom, player.nom)
          : "carte-joueur.pdf",
      );
      showToast("success", "Carte PDF téléchargée.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <PageToolbar
        title="Cartes licences"
        subtitle={
          loading
            ? "Chargement..."
            : `${players.length} carte${players.length !== 1 ? "s" : ""} · 1 par page PDF`
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filtrer par nom..."
        action={
          <PrimaryButton
            type="button"
            icon={FileDown}
            loading={bulkDownloading}
            disabled={loading || players.length === 0}
            onClick={handleBulkDownload}
          >
            <span className="hidden sm:inline">Télécharger tout</span>
            <span className="sm:hidden">Tout PDF</span>
          </PrimaryButton>
        }
      />

      <AdminCard className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <div>
              <label htmlFor="cards-competition-filter" className="field-label">
                Filtrer par compétition
              </label>
              <select
                id="cards-competition-filter"
                value={competitionId}
                onChange={(e) => handleCompetitionChange(e.target.value)}
                disabled={competitionsLoading}
                className="admin-select w-full"
              >
                <option value="">Toutes les compétitions</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cards-equipe-filter" className="field-label">
                Filtrer par équipe
              </label>
              <select
                id="cards-equipe-filter"
                value={equipeId}
                onChange={(e) => setEquipeId(e.target.value)}
                disabled={teamsLoading}
                className="admin-select w-full"
              >
                <option value="">Toutes les équipes</option>
                {filteredTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-500 lg:max-w-md">
            Chaque carte affiche le nom, le club, le poste et le QR code unique.
            Au scan, les informations du joueur s&apos;affichent dans le
            contrôle d&apos;accès.
          </p>
        </div>
      </AdminCard>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState message="Chargement des cartes..." />
      ) : players.length === 0 ? (
        <EmptyState message="Aucune carte à afficher pour ces critères." />
      ) : (
        <div className="player-cards-grid">
          {players.map((player) => (
            <PlayerLicenseCard
              key={player.id}
              player={player}
              downloading={downloadingId === player.id}
              onDownload={handleSingleDownload}
            />
          ))}
        </div>
      )}

      {players.length > 0 && (
        <div className="player-cards-bulk-bar">
          <p>
            Export PDF · {players.length} page{players.length !== 1 ? "s" : ""}
            {equipeId && selectedTeam ? ` · ${selectedTeam.nom}` : null}
            {!equipeId && competitionId && selectedCompetition
              ? ` · ${selectedCompetition.nom}`
              : null}
          </p>
          <OutlineButton
            type="button"
            icon={Download}
            loading={bulkDownloading}
            onClick={handleBulkDownload}
          >
            Télécharger le lot complet
          </OutlineButton>
        </div>
      )}
    </div>
  );
}

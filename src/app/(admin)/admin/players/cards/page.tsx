"use client";

import { Download, FileDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlayerLicenseCard } from "@/components/admin/PlayerLicenseCard";
import { PlayerSectionNav } from "@/components/admin/PlayerSectionNav";
import {
  AdminCard,
  EmptyState,
  LoadingState,
  OutlineButton,
  PageToolbar,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { usePlayers, useTeams } from "@/hooks/useApi";

async function downloadPdf(url: string, filename: string) {
  const res = await fetch(url);

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Erreur lors du téléchargement.");
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function PlayerCardsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
    }),
    [debouncedSearch, equipeId],
  );

  const { players, loading, error } = usePlayers(filters);
  const { teams, loading: teamsLoading } = useTeams();
  const { showToast } = useToast();

  const pdfQuery = equipeId ? `?equipeId=${encodeURIComponent(equipeId)}` : "";

  async function handleBulkDownload() {
    setBulkDownloading(true);

    try {
      await downloadPdf(
        `/api/players/cards/pdf${pdfQuery}`,
        `cartes-joueurs${equipeId ? `-equipe` : ""}.pdf`,
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
    setDownloadingId(id);

    try {
      await downloadPdf(`/api/players/${id}/card`, `carte-joueur-${id}.pdf`);
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

      <PlayerSectionNav />

      <AdminCard className="mb-6 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:max-w-xs sm:flex-1">
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
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.nom}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm leading-6 text-slate-500">
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

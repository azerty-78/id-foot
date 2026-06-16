"use client";

import { Search, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GhostButton } from "@/components/admin/ui";
import type { Player } from "@/hooks/useApi";
import { mapPlayerToValidatedPlayer, type ValidatedPlayer } from "./types";

type ManualPlayerSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (player: ValidatedPlayer) => void;
};

export function ManualPlayerSearchPanel({
  open,
  onClose,
  onSelectPlayer,
}: ManualPlayerSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const canSearch = open && trimmedQuery.length >= 2;
  const visibleResults = canSearch ? results : [];
  const visibleError = canSearch ? error : null;

  function handleClose() {
    setQuery("");
    setResults([]);
    setError(null);
    onClose();
  }

  function handleSelectPlayer(player: Player) {
    setQuery("");
    setResults([]);
    setError(null);
    onSelectPlayer(mapPlayerToValidatedPlayer(player));
  }

  useEffect(() => {
    if (!canSearch) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/players?q=${encodeURIComponent(trimmedQuery)}`,
        );
        if (!res.ok) throw new Error("Recherche impossible.");

        const data = (await res.json()) as Player[];
        setResults(data.slice(0, 8));
      } catch (err) {
        setResults([]);
        setError(err instanceof Error ? err.message : "Erreur de recherche.");
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [canSearch, trimmedQuery]);

  if (!open) return null;

  return (
    <div className="scan-manual-panel" role="dialog" aria-modal="true" aria-labelledby="manual-search-title">
      <div className="scan-manual-header">
        <div>
          <p id="manual-search-title" className="scan-manual-title">
            Recherche manuelle
          </p>
          <p className="scan-manual-subtitle">
            Secours uniquement — recherchez par nom ou prénom
          </p>
        </div>
        <button type="button" className="modal-close" onClick={handleClose} aria-label="Fermer">
          <X size={16} />
        </button>
      </div>

      <div className="scan-manual-search">
        <Search size={18} className="scan-manual-search-icon" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex. Aboubakar, Onana, Kamga…"
          className="scan-manual-input"
          autoFocus
        />
      </div>

      {loading && <p className="scan-manual-hint">Recherche en cours…</p>}
      {visibleError && <p className="scan-manual-error">{visibleError}</p>}
      {!loading && canSearch && visibleResults.length === 0 && !visibleError && (
        <p className="scan-manual-hint">Aucun joueur trouvé.</p>
      )}

      <ul className="scan-manual-results">
        {visibleResults.map((player) => (
          <li key={player.id}>
            <button
              type="button"
              className="scan-manual-result"
              onClick={() => handleSelectPlayer(player)}
            >
              <span className="scan-manual-result-icon" aria-hidden>
                <UserRound size={16} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="scan-manual-result-name">
                  {player.prenom} {player.nom}
                </span>
                <span className="scan-manual-result-meta">
                  #{player.numero} · {player.poste} · {player.equipe.nom}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <GhostButton type="button" onClick={handleClose} className="mt-4 w-full">
        Retour au scan
      </GhostButton>
    </div>
  );
}

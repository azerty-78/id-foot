"use client";

import { ChevronLeft, ChevronRight, Search, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { OutlineButton } from "@/components/admin/ui";
import { ShareCompetitionSignInButton } from "@/components/public/ShareCompetitionSignInButton";
import { buildCompetitionSignInHref } from "@/lib/competitionSlug";

const PAGE_SIZE = 12;

export type HomeCompetitionItem = {
  id: string;
  nom: string;
  slug: string;
  annee: number;
  lieu: string | null;
  image: string | null;
  createdAt: string;
  _count?: { equipes: number };
};

export function HomeCompetitionsSection({
  competitions,
}: {
  competitions: HomeCompetitionItem[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return competitions;

    return competitions.filter((competition) =>
      competition.nom.toLowerCase().includes(normalized),
    );
  }, [competitions, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <section className="home-section" aria-labelledby="competitions-title">
      <div className="home-section-header">
        <p className="text-section-label">Compétitions</p>
        <h2 id="competitions-title" className="text-h2">
          Tournois sur ID FOOT
        </h2>
        <p className="text-body home-section-lead">
          Recherchez une compétition et connectez-vous à son espace pour gérer
          clubs, joueurs et scanner QR.
        </p>
      </div>

      <div className="home-competitions-toolbar">
        <label className="home-competitions-search" htmlFor="competition-search">
          <Search size={16} aria-hidden className="home-competitions-search-icon" />
          <input
            id="competition-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom de compétition…"
            className="admin-input home-competitions-search-input"
            autoComplete="off"
          />
        </label>
        <p className="home-competitions-count" aria-live="polite">
          {filtered.length} compétition{filtered.length > 1 ? "s" : ""}
          {query.trim() ? " trouvée(s)" : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="home-competitions-empty">
          <UserRound size={28} className="text-slate-400" aria-hidden />
          <p className="text-body mt-3">
            {query.trim()
              ? "Aucune compétition ne correspond à votre recherche."
              : "Aucune compétition pour le moment. Créez la première pour démarrer."}
          </p>
        </div>
      ) : (
        <>
          <div className="home-competitions-grid">
            {paginated.map((competition) => (
              <article key={competition.id} className="home-competition-card">
                <a
                  href={buildCompetitionSignInHref(competition.slug)}
                  className="home-competition-card-link"
                >
                  <div className="home-competition-card-media">
                    {competition.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={competition.image}
                        alt=""
                        className="home-competition-card-image"
                      />
                    ) : (
                      <div
                        className="home-competition-card-placeholder"
                        aria-hidden
                      >
                        <Trophy size={28} />
                      </div>
                    )}
                    <span className="home-competition-card-year">
                      {competition.annee}
                    </span>
                  </div>
                  <div className="home-competition-card-body">
                    <h3 className="text-h3">{competition.nom}</h3>
                    {competition.lieu ? (
                      <p className="text-body mt-1">{competition.lieu}</p>
                    ) : null}
                    <p className="home-competition-card-meta">
                      {competition._count?.equipes ?? 0} équipe
                      {(competition._count?.equipes ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                </a>
                <div className="home-competition-card-actions">
                  <ShareCompetitionSignInButton
                    nom={competition.nom}
                    slug={competition.slug}
                    className="home-competition-card-share"
                  />
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="home-competitions-pagination"
              aria-label="Pagination des compétitions"
            >
              <OutlineButton
                type="button"
                icon={ChevronLeft}
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="Page précédente"
              >
                Précédent
              </OutlineButton>

              <span className="home-competitions-pagination-meta">
                Page {safePage} sur {totalPages}
              </span>

              <OutlineButton
                type="button"
                icon={ChevronRight}
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                aria-label="Page suivante"
              >
                Suivant
              </OutlineButton>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}

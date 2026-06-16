"use client";

import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  MapPin,
  Search,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OutlineButton, SecondaryLink } from "@/components/admin/ui";
import { ShareCompetitionSignInButton } from "@/components/public/ShareCompetitionSignInButton";
import { buildCompetitionSignInHref } from "@/lib/competitionSlug";

const PAGE_SIZE = 12;

export type HomeCompetitionItem = {
  id: string;
  nom: string;
  abbreviation: string;
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

  return (
    <section className="home-section" aria-labelledby="competitions-title">
      <div className="home-section-header">
        <p className="text-section-label">Compétitions</p>
        <h2 id="competitions-title" className="text-h2">
          Tournois sur ID FOOT
        </h2>
        <p className="text-body home-section-lead">
          Parcourez les compétitions, accédez à leur espace public ou partagez
          le lien de connexion pour l&apos;administration.
        </p>
      </div>

      <div className="home-competitions-toolbar">
        <label className="home-competitions-search" htmlFor="competition-search">
          <Search size={16} aria-hidden className="home-competitions-search-icon" />
          <input
            id="competition-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
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
            {paginated.map((competition) => {
              const teamCount = competition._count?.equipes ?? 0;

              return (
                <article key={competition.id} className="home-competition-card">
                  <Link
                    href={`/${competition.slug}`}
                    className="home-competition-card-link"
                  >
                    <div className="home-competition-card-media">
                      {competition.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={competition.image}
                          alt={competition.nom}
                          className="home-competition-card-image"
                        />
                      ) : (
                        <div
                          className="home-competition-card-placeholder"
                          aria-hidden
                        >
                          <Trophy size={32} />
                        </div>
                      )}
                      <div className="home-competition-card-overlay" aria-hidden />
                      <div className="home-competition-card-badges">
                        <span className="home-competition-card-year">
                          {competition.annee}
                        </span>
                        <span className="home-competition-card-teams">
                          <Users size={12} aria-hidden />
                          {teamCount} équipe{teamCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="home-competition-card-body">
                      <h3 className="home-competition-card-title">
                        {competition.nom}
                      </h3>
                      {competition.lieu ? (
                        <p className="home-competition-card-place">
                          <MapPin size={14} aria-hidden />
                          <span>{competition.lieu}</span>
                        </p>
                      ) : null}
                      <p className="home-competition-card-cta">
                        Voir la compétition
                      </p>
                    </div>
                  </Link>

                  <div className="home-competition-card-footer">
                    <ShareCompetitionSignInButton
                      nom={competition.nom}
                      slug={competition.slug}
                      abbreviation={competition.abbreviation}
                      className="home-competition-card-share"
                    />
                    <SecondaryLink
                      href={buildCompetitionSignInHref(competition.slug)}
                      icon={LogIn}
                      size="sm"
                      className="home-competition-card-signin"
                    >
                      Se connecter
                    </SecondaryLink>
                  </div>
                </article>
              );
            })}
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
                onClick={() => setPage(safePage - 1)}
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
                onClick={() => setPage(safePage + 1)}
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

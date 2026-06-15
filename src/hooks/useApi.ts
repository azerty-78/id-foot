"use client";

import { useCallback, useEffect, useState } from "react";

export type Competition = {
  id: string;
  nom: string;
  slug: string;
  annee: number;
  lieu: string | null;
  image: string | null;
  createdAt: string;
  _count?: { equipes: number };
};

export type Team = {
  id: string;
  nom: string;
  logo: string | null;
  competitionId: string;
  competition?: Competition;
  _count?: { joueurs: number };
  joueurs?: Player[];
};

export type Player = {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  nationalite: string | null;
  sexe: string | null;
  telephone: string | null;
  numero: number | null;
  poste: string | null;
  photo: string;
  qrToken: string;
  equipeId: string;
  createdAt: string;
  updatedAt: string;
  equipe: Team & { competition: Competition };
};

type PlayerFilters = {
  nom?: string;
  equipeId?: string;
  competitionId?: string;
};

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? `Erreur HTTP ${res.status}`;
  } catch {
    return `Erreur HTTP ${res.status}`;
  }
}

export function usePlayers(filters?: PlayerFilters) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters?.nom) params.set("nom", filters.nom);
    if (filters?.equipeId) params.set("equipeId", filters.equipeId);
    if (filters?.competitionId) params.set("competitionId", filters.competitionId);

    const query = params.toString();
    const url = `/api/players${query ? `?${query}` : ""}`;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(await parseErrorResponse(res));
        }

        const data = (await res.json()) as Player[];
        if (!cancelled) setPlayers(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters?.nom, filters?.equipeId, filters?.competitionId, refreshKey]);

  return { players, loading, error, refetch };
}

export function usePlayer(id: string) {
  const missingId = !id;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(!missingId);
  const [error, setError] = useState<string | null>(
    missingId ? "Identifiant joueur manquant." : null,
  );

  useEffect(() => {
    if (missingId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/players/${id}`);

        if (!res.ok) {
          throw new Error(await parseErrorResponse(res));
        }

        const data = (await res.json()) as Player;
        if (!cancelled) setPlayer(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
          setPlayer(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, missingId]);

  return { player, loading, error };
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/teams");

        if (!res.ok) {
          throw new Error(await parseErrorResponse(res));
        }

        const data = (await res.json()) as Team[];
        if (!cancelled) setTeams(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { teams, loading, error, refetch };
}

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/competitions");

        if (!res.ok) {
          throw new Error(await parseErrorResponse(res));
        }

        const data = (await res.json()) as Competition[];
        if (!cancelled) setCompetitions(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { competitions, loading, error, refetch };
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useCompetitions,
  usePlayers,
  useTeams,
  type Team,
} from "@/hooks/useApi";
import { validateEquipe } from "@/lib/validators";

type TeamItem = Team & {
  _count: { joueurs: number };
  competition: NonNullable<Team["competition"]>;
};

type FormState = {
  nom: string;
  competitionId: string;
  logo: string | null;
};

const emptyForm: FormState = { nom: "", competitionId: "", logo: null };

function getInitials(nom: string): string {
  return nom
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamsPage() {
  const { teams, loading, error, refetch } = useTeams();
  const { competitions, loading: competitionsLoading } = useCompetitions();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { players, loading: playersLoading } = usePlayers({
    equipeId: selectedTeamId ?? undefined,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedTeam = (teams as TeamItem[]).find(
    (team) => team.id === selectedTeamId
  );

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(form.logo);
      return;
    }

    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [logoFile, form.logo]);

  async function uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Erreur lors de l'upload du logo.");
    }

    const data = (await res.json()) as { url: string };
    return data.url;
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(team: TeamItem) {
    setEditingId(team.id);
    setForm({
      nom: team.nom,
      competitionId: team.competitionId,
      logo: team.logo,
    });
    setLogoFile(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setFormError(null);
  }

  async function handleSubmit() {
    const payload = {
      nom: form.nom,
      competitionId: form.competitionId,
      logo: form.logo,
    };

    const validation = validateEquipe(payload);
    if (!validation.valid) {
      setFormError(validation.errors[0]);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      let logoUrl = form.logo;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const url = editingId ? `/api/teams/${editingId}` : "/api/teams";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom.trim(),
          competitionId: form.competitionId,
          logo: logoUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'enregistrement.");
      }

      closeModal();
      refetch();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(team: TeamItem) {
    if (!window.confirm(`Supprimer l'équipe "${team.nom}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la suppression.");
      }

      if (selectedTeamId === team.id) {
        setSelectedTeamId(null);
      }

      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div className="relative">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Équipes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gérer les équipes et leurs joueurs
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153d24]"
        >
          + Créer une équipe
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Chargement...</p>
      ) : (teams as TeamItem[]).length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune équipe enregistrée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(teams as TeamItem[]).map((team) => (
            <article
              key={team.id}
              className={`cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                selectedTeamId === team.id
                  ? "border-[#1a472a] ring-2 ring-[#1a472a]/20"
                  : "border-zinc-200"
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <div className="mb-4 flex items-center gap-3">
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={team.nom}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a472a] text-sm font-bold text-white">
                    {getInitials(team.nom)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-zinc-900">
                    {team.nom}
                  </h2>
                  <p className="truncate text-sm text-zinc-500">
                    {team.competition?.nom}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {team._count?.joueurs ?? 0} joueur
                  {(team._count?.joueurs ?? 0) > 1 ? "s" : ""}
                </span>
              </div>

              <div
                className="flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => openEditModal(team)}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(team)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedTeam && (
        <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Joueurs — {selectedTeam.nom}
              </h2>
              <p className="text-sm text-zinc-500">
                {selectedTeam.competition?.nom}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTeamId(null)}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {playersLoading ? (
              <p className="text-sm text-zinc-500">Chargement des joueurs...</p>
            ) : players.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Aucun joueur dans cette équipe.
              </p>
            ) : (
              <ul className="space-y-3">
                {players.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">
                        {player.prenom} {player.nom}
                      </p>
                      <p className="text-sm text-zinc-500">
                        #{player.numero} · {player.poste}
                      </p>
                    </div>
                    <Link
                      href={`/admin/players/${player.id}`}
                      className="text-sm font-medium text-[#1a472a] hover:underline"
                    >
                      Voir
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">
              {editingId ? "Modifier l'équipe" : "Nouvelle équipe"}
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Nom *
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Compétition *
                </label>
                <select
                  value={form.competitionId}
                  onChange={(e) =>
                    setForm({ ...form, competitionId: e.target.value })
                  }
                  disabled={competitionsLoading}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
                >
                  <option value="">Sélectionner une compétition</option>
                  {competitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competition.nom} ({competition.annee})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1a472a] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                {logoPreview && (
                  <Image
                    src={logoPreview}
                    alt="Prévisualisation logo"
                    width={64}
                    height={64}
                    unoptimized
                    className="mt-3 h-16 w-16 rounded-full object-cover"
                  />
                )}
              </div>

              {formError && (
                <p className="text-sm text-rose-600">{formError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="rounded-lg bg-[#1a472a] px-4 py-2 text-sm font-medium text-white hover:bg-[#153d24] disabled:opacity-60"
              >
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

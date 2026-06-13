"use client";

import { useState } from "react";
import { useCompetitions } from "@/hooks/useApi";
import { validateCompetition } from "@/lib/validators";

type CompetitionItem = {
  id: string;
  nom: string;
  annee: number;
  lieu: string | null;
  _count: { equipes: number };
};

type FormState = {
  nom: string;
  annee: string;
  lieu: string;
};

const emptyForm: FormState = { nom: "", annee: "", lieu: "" };

export default function CompetitionsPage() {
  const { competitions, loading, error, refetch } = useCompetitions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(competition: CompetitionItem) {
    setEditingId(competition.id);
    setForm({
      nom: competition.nom,
      annee: String(competition.annee),
      lieu: competition.lieu ?? "",
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit() {
    const payload = {
      nom: form.nom,
      annee: Number.parseInt(form.annee, 10),
      lieu: form.lieu.trim() || null,
    };

    const validation = validateCompetition(payload);
    if (!validation.valid) {
      setFormError(validation.errors[0]);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const url = editingId
        ? `/api/competitions/${editingId}`
        : "/api/competitions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  async function handleDelete(competition: CompetitionItem) {
    if (
      !window.confirm(
        `Supprimer la compétition "${competition.nom}" ?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/competitions/${competition.id}`, {
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
          <h1 className="text-2xl font-bold text-zinc-900">Compétitions</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gérer les compétitions sportives
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153d24]"
        >
          + Créer une compétition
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Chargement...</p>
      ) : (competitions as CompetitionItem[]).length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune compétition enregistrée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(competitions as CompetitionItem[]).map((competition) => (
            <article
              key={competition.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {competition.nom}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {competition.annee}
                    {competition.lieu ? ` · ${competition.lieu}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-[#1a472a]/10 px-2.5 py-1 text-xs font-semibold text-[#1a472a]">
                  {competition._count?.equipes ?? 0} équipe
                  {(competition._count?.equipes ?? 0) > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(competition)}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(competition)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">
              {editingId ? "Modifier la compétition" : "Nouvelle compétition"}
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
                  Année *
                </label>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={form.annee}
                  onChange={(e) => setForm({ ...form, annee: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Lieu
                </label>
                <input
                  type="text"
                  value={form.lieu}
                  onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
                />
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

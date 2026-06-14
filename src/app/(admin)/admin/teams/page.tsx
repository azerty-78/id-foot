"use client";

import { Eye, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AdminCard,
  DangerButton,
  EmptyState,
  FieldError,
  FieldLabel,
  FormSubmitOverlay,
  GhostLink,
  LoadingState,
  OutlineButton,
  PageHeader,
  PrimaryButton,
  StatusBadge,
} from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/providers/ToastProvider";
import {
  useCompetitions,
  usePlayers,
  useTeams,
  type Competition,
  type Team,
} from "@/hooks/useApi";
import { validateEquipe } from "@/lib/validators";

type TeamItem = Team & {
  _count: { joueurs: number };
  competition: Competition;
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
  const { showToast } = useToast();
  const submitLockRef = useRef(false);
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
  const [submitMessage, setSubmitMessage] = useState("Enregistrement en cours…");

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) as
    | TeamItem
    | undefined;

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

  function resetModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setFormError(null);
  }

  function closeModal() {
    if (submitting) return;
    resetModal();
  }

  async function handleSubmit() {
    if (submitLockRef.current) return;

    const payload = {
      nom: form.nom.trim(),
      competitionId: form.competitionId,
      logo: form.logo,
    };

    const validation = validateEquipe(payload);
    if (!validation.valid) {
      setFormError(validation.errors[0]);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setFormError(null);

    try {
      let logoUrl = form.logo;

      if (logoFile) {
        setSubmitMessage("Envoi du logo…");
        logoUrl = await uploadLogo(logoFile);
      }

      setSubmitMessage("Enregistrement de l'équipe…");

      const url = editingId ? `/api/teams/${editingId}` : "/api/teams";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: payload.nom,
          competitionId: payload.competitionId,
          logo: logoUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'enregistrement.");
      }

      showToast(
        "success",
        editingId ? "Équipe mise à jour." : "Équipe créée avec succès.",
      );
      resetModal();
      refetch();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.",
      );
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
      setSubmitMessage("Enregistrement en cours…");
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
      <PageHeader
        title="Équipes"
        description="Gérez les clubs, leurs logos et consultez leurs effectifs."
        action={
          <PrimaryButton type="button" icon={Plus} onClick={openCreateModal}>
            Créer une équipe
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : teams.length === 0 ? (
        <EmptyState message="Aucune équipe enregistrée pour le moment." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => {
            const teamItem = team as TeamItem;

            return (
            <AdminCard
              key={team.id}
              className={`cursor-pointer p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${
                selectedTeamId === team.id ? "ring-2 ring-brand/30" : ""
              }`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <div className="mb-5 flex items-center gap-4">
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={team.nom}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-base font-bold text-white">
                    {getInitials(team.nom)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {team.nom}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    {teamItem.competition?.nom}
                  </p>
                </div>
                <StatusBadge tone="navy">
                  {teamItem._count?.joueurs ?? 0}
                </StatusBadge>
              </div>

              <div
                className="flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <OutlineButton
                  type="button"
                  icon={Pencil}
                  size="sm"
                  onClick={() => openEditModal(teamItem)}
                >
                  Modifier
                </OutlineButton>
                <DangerButton
                  type="button"
                  icon={Trash2}
                  size="sm"
                  onClick={() => handleDelete(teamItem)}
                >
                  Supprimer
                </DangerButton>
              </div>
            </AdminCard>
            );
          })}
        </div>
      )}

      {selectedTeam && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]"
            onClick={() => setSelectedTeamId(null)}
          />
          <aside className="admin-card fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col rounded-none border-l shadow-2xl sm:max-w-md">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand/60">
                  Effectif
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedTeam.nom}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedTeam.competition?.nom}
                </p>
              </div>
              <OutlineButton
                type="button"
                icon={X}
                size="sm"
                onClick={() => setSelectedTeamId(null)}
              >
                Fermer
              </OutlineButton>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {playersLoading ? (
                <LoadingState message="Chargement des joueurs..." />
              ) : players.length === 0 ? (
                <EmptyState message="Aucun joueur dans cette équipe." />
              ) : (
                <ul className="space-y-3">
                  {players.map((player) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {player.prenom} {player.nom}
                        </p>
                        <p className="text-sm text-slate-500">
                          #{player.numero} · {player.poste}
                        </p>
                      </div>
                      <GhostLink
                        href={`/admin/players/${player.id}`}
                        icon={Eye}
                        size="sm"
                      >
                        Voir
                      </GhostLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </>
      )}

      <AdminModal
        open={isModalOpen}
        title={editingId ? "Modifier l'équipe" : "Nouvelle équipe"}
        onClose={closeModal}
        historyKey="team-form"
        busy={submitting}
        footer={
          <>
            <OutlineButton
              type="button"
              icon={X}
              size="sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Annuler
            </OutlineButton>
            <PrimaryButton
              type="button"
              icon={Save}
              size="sm"
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </PrimaryButton>
          </>
        }
      >
        <FormSubmitOverlay visible={submitting} message={submitMessage} />
        <fieldset disabled={submitting} className="space-y-4 border-0 p-0 m-0">
          <div>
            <FieldLabel htmlFor="team-nom">Nom *</FieldLabel>
            <input
              id="team-nom"
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="admin-input"
            />
          </div>

          <div>
            <FieldLabel htmlFor="team-competition">Compétition *</FieldLabel>
            <select
              id="team-competition"
              value={form.competitionId}
              onChange={(e) =>
                setForm({ ...form, competitionId: e.target.value })
              }
              disabled={competitionsLoading}
              className="admin-input"
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
            <FieldLabel htmlFor="team-logo">Logo</FieldLabel>
            <input
              id="team-logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Prévisualisation logo"
                width={64}
                height={64}
                unoptimized
                className="mt-4 h-16 w-16 rounded-2xl object-cover ring-2 ring-brand/10"
              />
            )}
          </div>

          <FieldError message={formError ?? undefined} />
        </fieldset>
      </AdminModal>
    </div>
  );
}

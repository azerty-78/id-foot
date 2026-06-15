"use client";

import { ImagePlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  AdminCard,
  DangerButton,
  EmptyState,
  FieldError,
  FieldLabel,
  FormSubmitOverlay,
  LoadingState,
  OutlineButton,
  PageHeader,
  PrimaryButton,
  StatusBadge,
} from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { useToast } from "@/components/providers/ToastProvider";
import { useCompetitions, type Competition } from "@/hooks/useApi";
import { validateCompetition } from "@/lib/validators";

type FormState = {
  nom: string;
  annee: string;
  lieu: string;
  image: string;
};

const emptyForm: FormState = { nom: "", annee: "", lieu: "", image: "" };

export default function CompetitionsPage() {
  const { competitions, loading, error, refetch } = useCompetitions();
  const { showToast } = useToast();
  const submitLockRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("Enregistrement en cours…");

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(competition: Competition) {
    setEditingId(competition.id);
    setForm({
      nom: competition.nom,
      annee: String(competition.annee),
      lieu: competition.lieu ?? "",
      image: competition.image ?? "",
    });
    setImageFile(null);
    setImagePreview(competition.image);
    setFormError(null);
    setIsModalOpen(true);
  }

  function resetModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  }

  function closeModal() {
    if (submitting) return;
    resetModal();
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "competition");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Erreur lors de l'upload de l'image.");
    }

    const data = (await res.json()) as { url: string };
    return data.url;
  }

  function handleImageChange(file: File | null) {
    setImageFile(file);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(file ? URL.createObjectURL(file) : form.image || null);
  }

  async function handleSubmit() {
    if (submitLockRef.current) return;

    const payload = {
      nom: form.nom.trim(),
      annee: Number.parseInt(form.annee, 10),
      lieu: form.lieu.trim() || null,
    };

    const validation = validateCompetition(payload);
    if (!validation.valid) {
      setFormError(validation.errors[0]);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setFormError(null);
    setSubmitMessage("Enregistrement de la compétition…");

    try {
      let imageUrl = form.image.trim() || null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const url = editingId
        ? `/api/competitions/${editingId}`
        : "/api/competitions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, image: imageUrl }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'enregistrement.");
      }

      showToast(
        "success",
        editingId ? "Compétition mise à jour." : "Compétition créée avec succès.",
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

  async function handleDelete(competition: Competition) {
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
      <PageHeader
        title="Compétitions"
        description="Organisez les tournois et suivez le nombre d'équipes inscrites."
        action={
          <PrimaryButton type="button" icon={Plus} onClick={openCreateModal}>
            Créer une compétition
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
      ) : competitions.length === 0 ? (
        <EmptyState message="Aucune compétition enregistrée pour le moment." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {competitions.map((competition) => (
            <AdminCard
              key={competition.id}
              className="group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {competition.image ? (
                <div className="relative h-36 w-full bg-slate-100">
                  <Image
                    src={competition.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-400">
                  <ImagePlus size={28} aria-hidden />
                </div>
              )}

              <div className="p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="card-meta-badge">
                    {competition.annee}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {competition.nom}
                  </h2>
                  {competition.lieu && (
                    <p className="mt-2 text-sm text-slate-500">{competition.lieu}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">/{competition.slug}</p>
                </div>
                <StatusBadge tone="navy">
                  {competition._count?.equipes ?? 0} équipe
                  {(competition._count?.equipes ?? 0) > 1 ? "s" : ""}
                </StatusBadge>
              </div>

              <div className="flex flex-wrap gap-2">
                <OutlineButton
                  type="button"
                  icon={Pencil}
                  size="sm"
                  onClick={() => openEditModal(competition)}
                >
                  Modifier
                </OutlineButton>
                <DangerButton
                  type="button"
                  icon={Trash2}
                  size="sm"
                  onClick={() => handleDelete(competition)}
                >
                  Supprimer
                </DangerButton>
              </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <AdminModal
        open={isModalOpen}
        title={editingId ? "Modifier la compétition" : "Nouvelle compétition"}
        onClose={closeModal}
        historyKey="competition-form"
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
            <FieldLabel htmlFor="comp-nom">Nom *</FieldLabel>
            <input
              id="comp-nom"
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="admin-input"
              autoFocus
            />
          </div>
          <div>
            <FieldLabel htmlFor="comp-annee">Année *</FieldLabel>
            <input
              id="comp-annee"
              type="number"
              min={2000}
              max={2100}
              value={form.annee}
              onChange={(e) => setForm({ ...form, annee: e.target.value })}
              className="admin-input"
            />
          </div>
          <div>
            <FieldLabel htmlFor="comp-lieu">Lieu</FieldLabel>
            <input
              id="comp-lieu"
              type="text"
              value={form.lieu}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              className="admin-input"
            />
          </div>
          <div>
            <FieldLabel htmlFor="comp-image">Image de couverture</FieldLabel>
            <div className="create-competition-image-field">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="create-competition-image-preview"
                />
              ) : (
                <div className="create-competition-image-placeholder">
                  <ImagePlus size={24} aria-hidden />
                </div>
              )}
              <input
                ref={imageInputRef}
                id="comp-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              />
              <OutlineButton
                type="button"
                icon={ImagePlus}
                size="sm"
                onClick={() => imageInputRef.current?.click()}
              >
                {imagePreview ? "Changer l'image" : "Ajouter une image"}
              </OutlineButton>
            </div>
          </div>
          <FieldError message={formError ?? undefined} />
        </fieldset>
      </AdminModal>
    </div>
  );
}

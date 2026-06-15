"use client";

import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FieldError,
  FieldLabel,
  FormSubmitOverlay,
  OutlineButton,
  PrimaryButton,
} from "@/components/admin/ui";
import { PublicFooter, PublicHeader } from "@/components/public/PublicShell";
import { useToast } from "@/components/providers/ToastProvider";
import { validateCompetition } from "@/lib/validators";

type FormState = {
  nom: string;
  annee: string;
  lieu: string;
};

const emptyForm: FormState = {
  nom: "",
  annee: String(new Date().getFullYear()),
  lieu: "",
};

export default function CreateCompetitionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const submitLockRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(file: File | null) {
    setImageFile(file);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(file ? URL.createObjectURL(file) : null);
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

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, image: imageUrl }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la création.");
      }

      const competition = (await res.json()) as { slug: string };
      showToast("success", "Compétition créée avec succès.");
      router.push(`/${competition.slug}`);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de la création.",
      );
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="home-shell flex flex-col">
      <PublicHeader />

      <main className="home-main flex-1">
        <div className="create-competition-page">
          <Link href="/" className="create-competition-back">
            <ArrowLeft size={16} aria-hidden />
            Retour à l&apos;accueil
          </Link>

          <div className="create-competition-card">
            <p className="text-section-label">Inscription</p>
            <h1 className="text-h1 mt-2">Créer une compétition</h1>
            <p className="text-body mt-3">
              Renseignez les informations de votre tournoi. Vous serez redirigé
              vers son espace dédié une fois la compétition créée.
            </p>

            <FormSubmitOverlay
              visible={submitting}
              message="Création de la compétition…"
            />

            <fieldset
              disabled={submitting}
              className="create-competition-form border-0 p-0 m-0"
            >
              <div>
                <FieldLabel htmlFor="create-comp-nom">Nom *</FieldLabel>
                <input
                  id="create-comp-nom"
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="admin-input"
                  autoFocus
                />
              </div>

              <div className="create-competition-form-row">
                <div>
                  <FieldLabel htmlFor="create-comp-annee">Année *</FieldLabel>
                  <input
                    id="create-comp-annee"
                    type="number"
                    min={2000}
                    max={2100}
                    value={form.annee}
                    onChange={(e) =>
                      setForm({ ...form, annee: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="create-comp-lieu">Lieu</FieldLabel>
                  <input
                    id="create-comp-lieu"
                    type="text"
                    value={form.lieu}
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="create-comp-image">Image de couverture</FieldLabel>
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
                    ref={fileInputRef}
                    id="create-comp-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] ?? null)
                    }
                  />
                  <OutlineButton
                    type="button"
                    icon={ImagePlus}
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? "Changer l'image" : "Ajouter une image"}
                  </OutlineButton>
                </div>
              </div>

              <FieldError message={formError ?? undefined} />

              <PrimaryButton
                type="button"
                icon={Save}
                loading={submitting}
                onClick={() => void handleSubmit()}
                className="w-full sm:w-auto"
              >
                {submitting ? "Création…" : "Créer la compétition"}
              </PrimaryButton>
            </fieldset>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

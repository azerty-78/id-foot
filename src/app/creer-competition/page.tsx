"use client";

import { ImagePlus, Save, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FormSubmitOverlay,
  OutlineButton,
  PrimaryButton,
} from "@/components/admin/ui";
import { PublicFooter, PublicHeader } from "@/components/public/PublicShell";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ADMIN_COMPETITION_HOME,
  buildCompetitionSignInHref,
} from "@/lib/competitionSlug";
import {
  validateCompetition,
  validateCompetitionOwner,
} from "@/lib/validators";

type CompetitionFormState = {
  nom: string;
  annee: string;
  lieu: string;
};

type OwnerFormState = {
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyCompetitionForm: CompetitionFormState = {
  nom: "",
  annee: String(new Date().getFullYear()),
  lieu: "",
};

const emptyOwnerForm: OwnerFormState = {
  nom: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function CreateCompetitionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const submitLockRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [competitionForm, setCompetitionForm] =
    useState<CompetitionFormState>(emptyCompetitionForm);
  const [ownerForm, setOwnerForm] = useState<OwnerFormState>(emptyOwnerForm);
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

    const competitionPayload = {
      nom: competitionForm.nom.trim(),
      annee: Number.parseInt(competitionForm.annee, 10),
      lieu: competitionForm.lieu.trim() || null,
    };

    const competitionValidation = validateCompetition(competitionPayload);
    if (!competitionValidation.valid) {
      setFormError(competitionValidation.errors[0]);
      return;
    }

    const ownerValidation = validateCompetitionOwner(ownerForm);
    if (!ownerValidation.valid) {
      setFormError(ownerValidation.errors[0]);
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

      const res = await fetch("/api/competitions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...competitionPayload,
          image: imageUrl,
          owner: ownerForm,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la création.");
      }

      const competition = (await res.json()) as { slug: string };

      const signInResult = await signIn("credentials", {
        email: ownerForm.email.trim().toLowerCase(),
        password: ownerForm.password,
        competitionSlug: competition.slug,
        redirect: false,
      });

      if (signInResult?.error) {
        showToast(
          "success",
          "Compétition créée. Connectez-vous avec votre compte propriétaire.",
        );
        router.push(buildCompetitionSignInHref(competition.slug));
        return;
      }

      showToast("success", "Compétition et compte propriétaire créés.");
      router.push(ADMIN_COMPETITION_HOME);
      router.refresh();
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
      <PublicHeader backHref="/" backLabel="Retour à l'accueil" />

      <main className="home-main home-main--form flex-1">
        <div className="create-competition-page">
          <div
            className={`create-competition-card${submitting ? " form-card-busy" : ""}`}
          >
            <p className="text-section-label">Inscription</p>
            <h1 className="text-h1 mt-2">Créer une compétition</h1>
            <p className="text-body mt-3">
              Renseignez les informations du tournoi et créez le compte
              administrateur propriétaire. Seul ce compte pourra gérer cette
              compétition.
            </p>

            <FormSubmitOverlay
              visible={submitting}
              message="Création de la compétition et du compte…"
            />

            <fieldset
              disabled={submitting}
              className="create-competition-form border-0 p-0 m-0"
            >
              <section className="create-competition-section">
                <h2 className="text-h3">Compétition</h2>

                <div>
                  <FieldLabel htmlFor="create-comp-nom">Nom *</FieldLabel>
                  <input
                    id="create-comp-nom"
                    type="text"
                    value={competitionForm.nom}
                    onChange={(e) =>
                      setCompetitionForm({
                        ...competitionForm,
                        nom: e.target.value,
                      })
                    }
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
                      value={competitionForm.annee}
                      onChange={(e) =>
                        setCompetitionForm({
                          ...competitionForm,
                          annee: e.target.value,
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="create-comp-lieu">Lieu</FieldLabel>
                    <input
                      id="create-comp-lieu"
                      type="text"
                      value={competitionForm.lieu}
                      onChange={(e) =>
                        setCompetitionForm({
                          ...competitionForm,
                          lieu: e.target.value,
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="create-comp-image">
                    Image de couverture
                  </FieldLabel>
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
              </section>

              <section className="create-competition-section">
                <div className="create-competition-section-heading">
                  <UserRound size={18} aria-hidden />
                  <h2 className="text-h3">Propriétaire de la compétition</h2>
                </div>
                <FieldHint>
                  Compte administrateur par défaut. Vous pourrez créer des
                  comptes gestionnaires plus tard.
                </FieldHint>

                <div>
                  <FieldLabel htmlFor="owner-nom">Nom complet *</FieldLabel>
                  <input
                    id="owner-nom"
                    type="text"
                    value={ownerForm.nom}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, nom: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="owner-email">Email *</FieldLabel>
                  <input
                    id="owner-email"
                    type="email"
                    autoComplete="email"
                    value={ownerForm.email}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, email: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="create-competition-form-row">
                  <div>
                    <FieldLabel htmlFor="owner-password">
                      Mot de passe *
                    </FieldLabel>
                    <input
                      id="owner-password"
                      type="password"
                      autoComplete="new-password"
                      value={ownerForm.password}
                      onChange={(e) =>
                        setOwnerForm({
                          ...ownerForm,
                          password: e.target.value,
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="owner-confirm-password">
                      Confirmer *
                    </FieldLabel>
                    <input
                      id="owner-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={ownerForm.confirmPassword}
                      onChange={(e) =>
                        setOwnerForm({
                          ...ownerForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="admin-input"
                    />
                  </div>
                </div>
              </section>

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

"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { usePlayer, useTeams } from "@/hooks/useApi";
import { validateJoueur } from "@/lib/validators";
import {
  AdminCard,
  FieldError,
  FieldLabel,
  GhostButton,
  LoadingState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/ui";

const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"] as const;

type FormErrors = {
  prenom?: string;
  nom?: string;
  dateNaissance?: string;
  nationalite?: string;
  numero?: string;
  poste?: string;
  equipeId?: string;
  photo?: string;
  submit?: string;
};

function mapValidationErrors(errors: string[]): FormErrors {
  const fieldErrors: FormErrors = {};

  for (const error of errors) {
    if (error.includes("prénom")) fieldErrors.prenom = error;
    else if (error.includes("nom") || error.includes("Nom")) fieldErrors.nom = error;
    else if (error.includes("date de naissance") || error.includes("10 et 60 ans"))
      fieldErrors.dateNaissance = error;
    else if (error.includes("numéro") || error.includes("Numéro"))
      fieldErrors.numero = error;
    else if (error.includes("poste") || error.includes("Poste"))
      fieldErrors.poste = error;
    else if (error.includes("équipe") || error.includes("Équipe"))
      fieldErrors.equipeId = error;
    else fieldErrors.submit = error;
  }

  return fieldErrors;
}

function toDateInputValue(value: string): string {
  return new Date(value).toISOString().split("T")[0];
}

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { player, loading, error } = usePlayer(id);
  const { teams, loading: teamsLoading } = useTeams();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [numero, setNumero] = useState("");
  const [poste, setPoste] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!player || initialized) return;

    setPrenom(player.prenom);
    setNom(player.nom);
    setDateNaissance(toDateInputValue(player.dateNaissance));
    setNationalite(player.nationalite ?? "");
    setNumero(String(player.numero));
    setPoste(player.poste);
    setEquipeId(player.equipeId);
    setCurrentPhotoUrl(player.photo);
    setInitialized(true);
  }, [player, initialized]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [photoFile]);

  async function uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Erreur lors de l'upload de la photo.");
    }

    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const payload = {
      prenom,
      nom,
      dateNaissance,
      nationalite: nationalite.trim() || null,
      numero: Number.parseInt(numero, 10),
      poste,
      equipeId,
      sexe: player?.sexe ?? "Non renseigné",
    };

    const validation = validateJoueur(payload);
    if (!validation.valid) {
      setErrors(mapValidationErrors(validation.errors));
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = currentPhotoUrl;

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const res = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          photo: photoUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la modification du joueur.");
      }

      router.push(`/admin/players/${id}`);
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Erreur inconnue lors de la soumission.",
        photo:
          err instanceof Error && err.message.includes("photo")
            ? err.message
            : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const displayPhoto = photoPreview ?? currentPhotoUrl;

  if (loading || !initialized) {
    return <LoadingState message="Chargement du joueur..." />;
  }

  if (error || !player) {
    return (
      <AdminCard className="px-6 py-10 text-center">
        <p className="text-sm text-rose-700">{error ?? "Joueur introuvable."}</p>
        <Link href="/admin/players" className="mt-4 inline-block">
          <GhostButton>Retour à la liste</GhostButton>
        </Link>
      </AdminCard>
    );
  }

  return (
    <div>
      <PageHeader
        title="Modifier le joueur"
        description={`Mettre à jour les informations de ${player.prenom} ${player.nom}.`}
      />

      <AdminCard className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="prenom">Prénom *</FieldLabel>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="admin-input"
              />
              <FieldError message={errors.prenom} />
            </div>

            <div>
              <FieldLabel htmlFor="nom">Nom *</FieldLabel>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="admin-input"
              />
              <FieldError message={errors.nom} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="dateNaissance">Date de naissance *</FieldLabel>
              <input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="admin-input"
              />
              <FieldError message={errors.dateNaissance} />
            </div>

            <div>
              <FieldLabel htmlFor="nationalite">Nationalité</FieldLabel>
              <input
                id="nationalite"
                type="text"
                value={nationalite}
                onChange={(e) => setNationalite(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="numero">Numéro *</FieldLabel>
              <input
                id="numero"
                type="number"
                min={1}
                max={99}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="admin-input"
              />
              <FieldError message={errors.numero} />
            </div>

            <div>
              <FieldLabel htmlFor="poste">Poste *</FieldLabel>
              <select
                id="poste"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                className="admin-input"
              >
                <option value="">Sélectionner un poste</option>
                {POSTES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <FieldError message={errors.poste} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="equipeId">Équipe *</FieldLabel>
            <select
              id="equipeId"
              value={equipeId}
              onChange={(e) => setEquipeId(e.target.value)}
              disabled={teamsLoading}
              className="admin-input"
            >
              <option value="">Sélectionner une équipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.nom}
                </option>
              ))}
            </select>
            <FieldError message={errors.equipeId} />
          </div>

          <div>
            <FieldLabel htmlFor="photo">Photo</FieldLabel>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
            />
            <FieldError message={errors.photo} />
            {displayPhoto && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-500">Prévisualisation</p>
                <Image
                  src={displayPhoto}
                  alt="Prévisualisation photo joueur"
                  width={120}
                  height={120}
                  unoptimized
                  className="h-28 w-28 rounded-2xl border border-slate-200 object-cover ring-2 ring-brand/10"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link href={`/admin/players/${id}`}>
              <SecondaryButton type="button">Annuler</SecondaryButton>
            </Link>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </PrimaryButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

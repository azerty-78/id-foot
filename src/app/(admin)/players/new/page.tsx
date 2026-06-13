"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useTeams } from "@/hooks/useApi";
import { validateJoueur } from "@/lib/validators";

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

export default function NewPlayerPage() {
  const router = useRouter();
  const { teams, loading: teamsLoading } = useTeams();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [numero, setNumero] = useState("");
  const [poste, setPoste] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

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
      sexe: "Non renseigné",
    };

    const validation = validateJoueur(payload);
    if (!validation.valid) {
      setErrors(mapValidationErrors(validation.errors));
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          photo: photoUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la création du joueur.");
      }

      router.push("/admin/players");
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Ajouter un joueur</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enregistrer un nouveau joueur dans le système
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-xl bg-white p-6 shadow-sm"
      >
        {errors.submit && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="prenom" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Prénom *
            </label>
            <input
              id="prenom"
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            />
            {errors.prenom && (
              <p className="mt-1 text-xs text-rose-600">{errors.prenom}</p>
            )}
          </div>

          <div>
            <label htmlFor="nom" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Nom *
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-rose-600">{errors.nom}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="dateNaissance"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Date de naissance *
            </label>
            <input
              id="dateNaissance"
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            />
            {errors.dateNaissance && (
              <p className="mt-1 text-xs text-rose-600">{errors.dateNaissance}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="nationalite"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Nationalité
            </label>
            <input
              id="nationalite"
              type="text"
              value={nationalite}
              onChange={(e) => setNationalite(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="numero" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Numéro *
            </label>
            <input
              id="numero"
              type="number"
              min={1}
              max={99}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            />
            {errors.numero && (
              <p className="mt-1 text-xs text-rose-600">{errors.numero}</p>
            )}
          </div>

          <div>
            <label htmlFor="poste" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Poste *
            </label>
            <select
              id="poste"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
            >
              <option value="">Sélectionner un poste</option>
              {POSTES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.poste && (
              <p className="mt-1 text-xs text-rose-600">{errors.poste}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="equipeId" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Équipe *
          </label>
          <select
            id="equipeId"
            value={equipeId}
            onChange={(e) => setEquipeId(e.target.value)}
            disabled={teamsLoading}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
          >
            <option value="">Sélectionner une équipe</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.nom}
              </option>
            ))}
          </select>
          {errors.equipeId && (
            <p className="mt-1 text-xs text-rose-600">{errors.equipeId}</p>
          )}
        </div>

        <div>
          <label htmlFor="photo" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#1a472a] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#153d24]"
          />
          {errors.photo && (
            <p className="mt-1 text-xs text-rose-600">{errors.photo}</p>
          )}
          {photoPreview && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-zinc-500">Prévisualisation</p>
              <Image
                src={photoPreview}
                alt="Prévisualisation photo joueur"
                width={120}
                height={120}
                unoptimized
                className="h-28 w-28 rounded-full border border-zinc-200 object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/players"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#153d24] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enregistrement..." : "Enregistrer le joueur"}
          </button>
        </div>
      </form>
    </div>
  );
}

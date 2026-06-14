"use client";

import { Save, Shield, Trophy, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { PlayerIdentityCard } from "@/components/admin/PlayerIdentityCard";
import {
  AdminCard,
  CollapsibleFormSection,
  FieldHint,
  FormInput,
  FormSection,
  FormSubmitOverlay,
  GhostLink,
  OutlineLink,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { useTeams, type Player } from "@/hooks/useApi";
import { validateJoueur } from "@/lib/validators";
import { compressImageForUpload } from "@/lib/compressImage";
import { DEFAULT_NATIONALITY, NATIONALITIES } from "@/lib/nationalities";
import {
  composePhoneNumber,
  DEFAULT_PHONE_DIAL,
  formatLocalPhone,
  getPhoneCountry,
  parsePhoneNumber,
  PHONE_COUNTRIES,
} from "@/lib/phoneCountries";
import { DEFAULT_SEXE, POSTES, SEXES } from "@/types/player";

export type PlayerFormValues = {
  prenom: string;
  nom: string;
  dateNaissance: string;
  nationalite: string;
  sexe: string;
  phoneDial: string;
  phoneLocal: string;
  numeroMaillot: string;
  poste: string;
  equipeId: string;
};

type FormErrors = Partial<
  Record<keyof PlayerFormValues | "photo" | "submit" | "telephone", string>
>;

const emptyValues: PlayerFormValues = {
  prenom: "",
  nom: "",
  dateNaissance: "",
  nationalite: DEFAULT_NATIONALITY,
  sexe: DEFAULT_SEXE,
  phoneDial: DEFAULT_PHONE_DIAL,
  phoneLocal: "",
  numeroMaillot: "",
  poste: "",
  equipeId: "",
};

function mapValidationErrors(errors: string[]): FormErrors {
  const fieldErrors: FormErrors = {};

  for (const error of errors) {
    if (error.includes("prénom")) fieldErrors.prenom = error;
    else if (error.includes("nom") && !error.includes("prénom")) fieldErrors.nom = error;
    else if (error.includes("date de naissance") || error.includes("âge"))
      fieldErrors.dateNaissance = error;
    else if (error.includes("sexe")) fieldErrors.sexe = error;
    else if (error.includes("téléphone")) fieldErrors.telephone = error;
    else if (error.includes("maillot")) fieldErrors.numeroMaillot = error;
    else if (error.includes("poste")) fieldErrors.poste = error;
    else if (error.includes("photo")) fieldErrors.photo = error;
    else if (error.includes("club") || error.includes("équipe"))
      fieldErrors.equipeId = error;
    else fieldErrors.submit = error;
  }

  return fieldErrors;
}

function toDateInputValue(value: string): string {
  return new Date(value).toISOString().split("T")[0];
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

type PlayerFormProps = {
  mode: "create" | "edit";
  initialPlayer?: Player;
  playerId?: string;
  cancelHref: string;
  onSuccess: (playerId: string) => void;
};

export function PlayerForm({
  mode,
  initialPlayer,
  playerId,
  cancelHref,
  onSuccess,
}: PlayerFormProps) {
  const { teams, loading: teamsLoading } = useTeams();
  const { showToast } = useToast();
  const submitLockRef = useRef(false);
  const [values, setValues] = useState<PlayerFormValues>(emptyValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [contactOpen, setContactOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("Enregistrement en cours…");

  useEffect(() => {
    if (!initialPlayer) return;

    const phone = parsePhoneNumber(initialPlayer.telephone);

    setValues({
      prenom: initialPlayer.prenom,
      nom: initialPlayer.nom,
      dateNaissance: initialPlayer.dateNaissance
        ? toDateInputValue(initialPlayer.dateNaissance)
        : "",
      nationalite: initialPlayer.nationalite ?? DEFAULT_NATIONALITY,
      sexe:
        initialPlayer.sexe === "Féminin" ? "Féminin" : DEFAULT_SEXE,
      phoneDial: phone.dial,
      phoneLocal: phone.local,
      numeroMaillot: initialPlayer.numero != null ? String(initialPlayer.numero) : "",
      poste: initialPlayer.poste ?? "",
      equipeId: initialPlayer.equipeId,
    });
    setCurrentPhotoUrl(initialPlayer.photo);
    setContactOpen(Boolean(initialPlayer.telephone?.trim()));
    setSportOpen(
      Boolean(
        initialPlayer.numero != null ||
          (initialPlayer.poste && initialPlayer.poste.trim()),
      ),
    );
  }, [initialPlayer]);

  useEffect(() => {
    if (errors.telephone) setContactOpen(true);
  }, [errors.telephone]);

  useEffect(() => {
    if (errors.numeroMaillot || errors.poste) setSportOpen(true);
  }, [errors.numeroMaillot, errors.poste]);

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

  const teamsByCompetition = useMemo(() => {
    const groups = new Map<string, typeof teams>();

    for (const team of teams) {
      const label = team.competition
        ? `${team.competition.nom} (${team.competition.annee})`
        : "Autres clubs";
      const list = groups.get(label) ?? [];
      list.push(team);
      groups.set(label, list);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [teams]);

  const nationalityOptions = useMemo(() => {
    const options = [...NATIONALITIES];
    const current = values.nationalite.trim();

    if (current && !options.includes(current as (typeof NATIONALITIES)[number])) {
      options.unshift(current as (typeof NATIONALITIES)[number]);
    }

    return options;
  }, [values.nationalite]);

  const selectedTeam = teams.find((team) => team.id === values.equipeId);
  const displayPhoto = photoPreview ?? currentPhotoUrl;
  const phonePreview = composePhoneNumber(values.phoneDial, values.phoneLocal);
  const phoneCountry = getPhoneCountry(values.phoneDial);

  function updateField<K extends keyof PlayerFormValues>(key: K, value: PlayerFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined, telephone: undefined }));
  }

  function handlePhoneLocalChange(raw: string) {
    updateField("phoneLocal", formatLocalPhone(values.phoneDial, raw));
  }

  function handlePhoneDialChange(dial: string) {
    setValues((current) => ({
      ...current,
      phoneDial: dial,
      phoneLocal: formatLocalPhone(dial, current.phoneLocal),
    }));
    setErrors((current) => ({ ...current, telephone: undefined, submit: undefined }));
  }

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
    if (submitLockRef.current) return;
    setErrors({});

    if (!photoFile && !currentPhotoUrl) {
      setErrors({ photo: "La photo du joueur est requise." });
      return;
    }

    const payload = {
      prenom: values.prenom.trim(),
      nom: values.nom.trim(),
      dateNaissance: values.dateNaissance.trim() || null,
      nationalite: values.nationalite.trim() || null,
      sexe: values.sexe.trim(),
      telephone: phonePreview || null,
      numero: values.numeroMaillot.trim()
        ? Number.parseInt(values.numeroMaillot, 10)
        : null,
      poste: values.poste.trim() || null,
      equipeId: values.equipeId,
      photo: currentPhotoUrl ?? (photoFile ? "__pending__" : ""),
    };

    const validation = validateJoueur(payload);
    if (!validation.valid) {
      setErrors(mapValidationErrors(validation.errors));
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setSubmitMessage(photoFile ? "Envoi de la photo…" : (
      mode === "create" ? "Création du joueur…" : "Mise à jour du joueur…"
    ));

    try {
      let photoUrl = currentPhotoUrl;

      if (photoFile) {
        setSubmitMessage("Optimisation de la photo…");
        const optimized = await compressImageForUpload(photoFile);
        setSubmitMessage("Envoi de la photo…");
        photoUrl = await uploadPhoto(optimized);
        setSubmitMessage(
          mode === "create" ? "Création du joueur…" : "Mise à jour du joueur…",
        );
      }

      if (!photoUrl) {
        throw new Error("La photo du joueur est requise.");
      }

      const url =
        mode === "create" ? "/api/players" : `/api/players/${playerId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          photo: photoUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(
          data.error ??
            (mode === "create"
              ? "Erreur lors de la création du joueur."
              : "Erreur lors de la modification du joueur."),
        );
      }

      const saved = (await res.json()) as Player;
      showToast(
        "success",
        mode === "create" ? "Joueur enregistré avec succès." : "Joueur mis à jour.",
      );
      onSuccess(saved.id);
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
      submitLockRef.current = false;
      setSubmitting(false);
      setSubmitMessage("Enregistrement en cours…");
    }
  }

  const inputClass = (field: keyof PlayerFormValues) =>
    `admin-input ${errors[field] ? "admin-input-error" : ""}`;

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <AdminCard className={`order-2 p-4 sm:p-6 xl:order-1 ${submitting ? "form-card-busy" : ""}`}>
        <FormSubmitOverlay visible={submitting} message={submitMessage} />
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={submitting} className="space-y-6 border-0 p-0 m-0">
          {errors.submit && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.submit}
            </div>
          )}

          <FormSection
            title="Identité"
            description="Prénom, nom et sexe obligatoires. Les autres champs sont facultatifs."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                id="prenom"
                label="Prénom"
                required
                error={errors.prenom}
              >
                <input
                  id="prenom"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Ex. Jean"
                  value={values.prenom}
                  onChange={(e) => updateField("prenom", e.target.value)}
                  className={inputClass("prenom")}
                />
              </FormInput>

              <FormInput id="nom" label="Nom" required error={errors.nom}>
                <input
                  id="nom"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Ex. Dupont"
                  value={values.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  className={inputClass("nom")}
                />
              </FormInput>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                id="dateNaissance"
                label="Date de naissance"
                hint="Facultatif."
                error={errors.dateNaissance}
              >
                <input
                  id="dateNaissance"
                  type="date"
                  value={values.dateNaissance}
                  onChange={(e) => updateField("dateNaissance", e.target.value)}
                  className={inputClass("dateNaissance")}
                />
              </FormInput>

              <FormInput id="sexe" label="Sexe" required error={errors.sexe}>
                <select
                  id="sexe"
                  value={values.sexe}
                  onChange={(e) => updateField("sexe", e.target.value)}
                  className="admin-input"
                >
                  {SEXES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormInput>
            </div>

            <FormInput
              id="nationalite"
              label="Nationalité"
              hint="Facultatif."
            >
              <select
                id="nationalite"
                value={values.nationalite}
                onChange={(e) => updateField("nationalite", e.target.value)}
                className="admin-input"
              >
                {nationalityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormInput>
          </FormSection>

          <FormSection
            title="Club"
            description="Sélectionnez l'équipe du joueur."
          >
            {teamsLoading ? (
              <p className="text-sm text-slate-500">Chargement des clubs...</p>
            ) : teams.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                <p className="font-medium">Aucun club disponible.</p>
                <p className="mt-1 text-amber-800/90">
                  Créez d&apos;abord une compétition puis une équipe.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <GhostLink href="/admin/competitions" icon={Trophy} size="sm">
                    Créer une compétition
                  </GhostLink>
                  <GhostLink href="/admin/teams" icon={Shield} size="sm">
                    Créer un club
                  </GhostLink>
                </div>
              </div>
            ) : (
              <FormInput
                id="equipeId"
                label="Club / Équipe"
                required
                error={errors.equipeId}
                hint="Les clubs sont regroupés par compétition."
              >
                <select
                  id="equipeId"
                  value={values.equipeId}
                  onChange={(e) => updateField("equipeId", e.target.value)}
                  className={inputClass("equipeId")}
                >
                  <option value="">Choisir un club...</option>
                  {teamsByCompetition.map(([competition, competitionTeams]) => (
                    <optgroup key={competition} label={competition}>
                      {competitionTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.nom}
                          {team._count?.joueurs != null
                            ? ` (${team._count.joueurs} joueur${team._count.joueurs > 1 ? "s" : ""})`
                            : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </FormInput>
            )}
          </FormSection>

          <FormSection title="Photo" description="Portrait obligatoire pour la licence.">
            <FormInput id="photo" label="Photo du joueur" required error={errors.photo}>
              <label
                htmlFor="photo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-8 transition hover:border-brand/40 hover:bg-brand-light/20"
              >
                <span className="text-sm font-medium text-slate-700">
                  Cliquez pour choisir une image
                </span>
                <span className="mt-1 text-xs text-slate-400">JPG, PNG — max. recommandé 2 Mo</span>
                <input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </FormInput>

            {displayPhoto && (
              <div className="flex items-center gap-4">
                <Image
                  src={displayPhoto}
                  alt="Prévisualisation photo joueur"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-brand/10"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">Prévisualisation</p>
                  <FieldHint>La photo apparaîtra sur la carte licence.</FieldHint>
                </div>
              </div>
            )}
          </FormSection>

          <CollapsibleFormSection
            title="Contact"
            description="Coordonnées du joueur ou du tuteur (facultatif)."
            open={contactOpen}
            onOpenChange={setContactOpen}
          >
            <FormInput
              id="telephone"
              label="Numéro de téléphone"
              error={errors.telephone}
              hint={`Indicatif modifiable · ex. ${values.phoneDial} 6XX XXX XXX`}
            >
              <div className="phone-input-row">
                <select
                  id="phoneDial"
                  value={values.phoneDial}
                  onChange={(e) => handlePhoneDialChange(e.target.value)}
                  className="admin-input phone-input-dial"
                  aria-label="Indicatif pays"
                >
                  {PHONE_COUNTRIES.map((country) => (
                    <option key={country.dial} value={country.dial}>
                      {country.label} ({country.dial})
                    </option>
                  ))}
                </select>
                <input
                  id="telephone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder={
                    values.phoneDial === "+237" ? "6XX XXX XXX" : "Numéro local"
                  }
                  value={values.phoneLocal}
                  onChange={(e) => handlePhoneLocalChange(e.target.value)}
                  className={`admin-input phone-input-local ${errors.telephone ? "admin-input-error" : ""}`}
                  maxLength={phoneCountry.localLength + 5}
                />
              </div>
            </FormInput>
          </CollapsibleFormSection>

          <CollapsibleFormSection
            title="Informations sportives"
            description="Poste et numéro de maillot (facultatifs)."
            open={sportOpen}
            onOpenChange={setSportOpen}
          >
            <FormInput
              id="numeroMaillot"
              label="Numéro de maillot"
              error={errors.numeroMaillot}
              hint="Facultatif — de 1 à 99."
            >
              <input
                id="numeroMaillot"
                type="number"
                min={1}
                max={99}
                placeholder="Ex. 10"
                value={values.numeroMaillot}
                onChange={(e) => updateField("numeroMaillot", e.target.value)}
                className={inputClass("numeroMaillot")}
              />
            </FormInput>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Poste <span className="font-normal text-slate-400">(facultatif)</span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {POSTES.map((item) => {
                  const active = values.poste === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        updateField("poste", active ? "" : item)
                      }
                      className={`poste-pill rounded-xl px-3 py-2.5 text-xs font-semibold sm:text-sm ${
                        active ? "poste-pill-active" : ""
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {errors.poste && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.poste}</p>
              )}
            </div>
          </CollapsibleFormSection>

          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <OutlineLink href={cancelHref} icon={X}>
              Annuler
            </OutlineLink>
            <PrimaryButton
              type="submit"
              icon={Save}
              loading={submitting}
              disabled={teams.length === 0}
            >
              {submitting
                ? "Enregistrement…"
                : mode === "create"
                  ? "Enregistrer le joueur"
                  : "Enregistrer les modifications"}
            </PrimaryButton>
          </div>
        </form>
      </AdminCard>

      <aside className="order-1 xl:sticky xl:top-8 xl:order-2 xl:self-start">
        <div className="space-y-4">
          <PlayerIdentityCard
            prenom={values.prenom}
            nom={values.nom}
            numero={values.numeroMaillot || "—"}
            poste={values.poste}
            equipe={selectedTeam?.nom ?? "—"}
            photo={displayPhoto}
          />

          <AdminCard>
            <div className="space-y-2 text-sm">
              <p className="text-body">
                <span className="font-medium text-navy">Compétition :</span>{" "}
                {selectedTeam?.competition?.nom ?? "—"}
              </p>
              <p className="text-body">
                <span className="font-medium text-navy">Club :</span>{" "}
                {selectedTeam?.nom ?? "—"}
              </p>
            </div>
          </AdminCard>
        </div>
      </aside>
    </div>
  );
}

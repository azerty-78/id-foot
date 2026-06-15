"use client";

import { LogOut, Save, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FormSection,
  GhostLink,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import type { PublicUser } from "@/lib/auth/users";
import { roleLabel } from "@/lib/auth/users";

type ProfileAccountSectionProps = {
  initialUser: PublicUser;
  onUserUpdated: (user: PublicUser) => void;
};

export function ProfileAccountSection({
  initialUser,
  onUserUpdated,
}: ProfileAccountSectionProps) {
  const { update } = useSession();
  const { showToast } = useToast();
  const [nom, setNom] = useState(initialUser.nom);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNom(initialUser.nom);
  }, [initialUser.nom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim() }),
      });
      const data = (await res.json()) as PublicUser & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Impossible de mettre à jour le profil.");
        return;
      }

      onUserUpdated(data);
      await update({ name: data.nom });
      showToast("success", "Nom mis à jour.");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormSection
      title="Mon compte"
      description="Modifiez votre nom d'affichage. L'email ne peut pas être changé."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel htmlFor="profile-nom">Nom</FieldLabel>
          <div className="input-icon-wrap mt-1.5">
            <User className="input-icon" size={16} strokeWidth={2} aria-hidden />
            <input
              id="profile-nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="admin-input w-full"
              autoComplete="name"
              required
              minLength={2}
            />
          </div>
          <FieldError message={error ?? undefined} />
        </div>

        <div>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <input
            id="profile-email"
            type="email"
            value={initialUser.email}
            readOnly
            disabled
            className="admin-input mt-1.5 w-full cursor-not-allowed opacity-70"
          />
          <FieldHint>L&apos;adresse email est liée à votre compte et ne peut pas être modifiée.</FieldHint>
        </div>

        <div>
          <FieldLabel>Rôle</FieldLabel>
          <p className="mt-1.5 text-sm font-medium text-navy">{roleLabel(initialUser.role)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <PrimaryButton type="submit" icon={Save} loading={submitting}>
            Enregistrer
          </PrimaryButton>
          <GhostLink href="/admin/signout" icon={LogOut}>
            Se déconnecter
          </GhostLink>
        </div>
      </form>
    </FormSection>
  );
}

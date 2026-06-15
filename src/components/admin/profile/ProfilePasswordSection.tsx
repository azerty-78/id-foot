"use client";

import { KeyRound, Save } from "lucide-react";
import { useState } from "react";
import {
  FieldError,
  FieldLabel,
  FormSection,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ProfilePasswordSection() {
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Impossible de changer le mot de passe.");
        return;
      }

      setForm(emptyForm);
      showToast("success", "Mot de passe mis à jour.");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormSection
      title="Mot de passe"
      description="Choisissez un mot de passe d'au moins 8 caractères."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel htmlFor="current-password">Mot de passe actuel</FieldLabel>
          <div className="input-icon-wrap mt-1.5">
            <KeyRound className="input-icon" size={16} strokeWidth={2} aria-hidden />
            <input
              id="current-password"
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className="admin-input w-full"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="new-password">Nouveau mot de passe</FieldLabel>
          <input
            id="new-password"
            type="password"
            value={form.newPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            className="admin-input mt-1.5 w-full"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <FieldLabel htmlFor="confirm-password">Confirmer le mot de passe</FieldLabel>
          <input
            id="confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            className="admin-input mt-1.5 w-full"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <FieldError message={error ?? undefined} />
        </div>

        <PrimaryButton type="submit" icon={Save} loading={submitting}>
          Mettre à jour le mot de passe
        </PrimaryButton>
      </form>
    </FormSection>
  );
}

"use client";

import { ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import {
  AdminCard,
  FieldLabel,
  GhostLink,
  PrimaryButton,
} from "@/components/admin/ui";
import { AppLogo } from "@/components/brand/AppLogo";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Connexion impossible. Vérifiez vos identifiants.");
        return;
      }

      router.push(result?.url ?? callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminCard className="overflow-hidden">
      <div className="bg-gradient-to-br from-brand-dark via-[#0d1219] to-black px-6 py-8">
        <AppLogo size="lg" />
        <p className="mt-3 text-sm text-white/70">Connexion administration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Mode provisoire : saisissez un email valide pour accéder à l&apos;admin.
          L&apos;authentification réelle sera activée ultérieurement.
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@football-id.com"
            className="admin-input"
          />
        </div>

        <div>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="admin-input"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Mot de passe ignoré pour le moment (développement).
          </p>
        </div>

        <PrimaryButton type="submit" icon={LogIn} disabled={submitting} className="w-full">
          {submitting ? "Connexion..." : "Se connecter"}
        </PrimaryButton>

        <div className="text-center">
          <GhostLink href="/" icon={ArrowLeft}>
            Retour à l&apos;accueil
          </GhostLink>
        </div>
      </form>
    </AdminCard>
  );
}

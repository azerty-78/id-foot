"use client";

import { Eye, EyeOff, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import {
  FieldLabel,
  InputWithIcon,
  PrimaryButton,
} from "@/components/admin/ui";
import { AppLogo } from "@/components/brand/AppLogo";
import { useToast } from "@/components/providers/ToastProvider";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const message = "Connexion impossible. Vérifiez vos identifiants.";
        setError(message);
        showToast("error", message);
        return;
      }

      showToast("success", "Connexion réussie.");
      router.push(result?.url ?? callbackUrl);
      router.refresh();
    } catch {
      const message = "Une erreur est survenue lors de la connexion.";
      setError(message);
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-layout">
      <div className="login-panel-navy">
        <AppLogo size="xl" />
        <p className="login-tagline">
          Système d&apos;identification et de gestion des licences joueurs ID FOOT.
        </p>
      </div>

      <div className="login-panel-form">
        <div className="login-form-inner">
          <div className="mb-8 lg:hidden">
            <AppLogo size="md" />
          </div>

          <h1 className="text-h2">Connexion</h1>
          <p className="text-body mt-2">
            Accédez à l&apos;espace d&apos;administration ID FOOT.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="rounded-[var(--radius-md)] border border-warning/30 bg-[#fef4e4] px-4 py-3 text-[13px] leading-relaxed text-[#b07500]">
              Mode provisoire : saisissez un email valide. Le mot de passe est ignoré
              en développement.
            </div>

            {error && (
              <div className="rounded-[var(--radius-md)] border border-danger/20 bg-[#fdeaea] px-4 py-3 text-[13px] text-danger">
                {error}
              </div>
            )}

            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputWithIcon icon={Mail}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@id-foot.com"
                  className="admin-input"
                />
              </InputWithIcon>
            </div>

            <div>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <div className="password-field-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <PrimaryButton
              type="submit"
              icon={LogIn}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </PrimaryButton>

            <Link href="#" className="login-forgot">
              Mot de passe oublié ?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

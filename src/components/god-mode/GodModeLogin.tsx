"use client";

import { Eye, EyeOff, LogIn, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  FieldError,
  FieldLabel,
  InputWithIcon,
  PrimaryButton,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";

export function GodModeLogin() {
  const router = useRouter();
  const { showToast } = useToast();
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
      const res = await fetch("/api/god-mode/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        const message = data.error ?? "Connexion god-mode impossible.";
        setError(message);
        showToast("error", message);
        return;
      }

      showToast("success", "Accès god-mode autorisé.");
      router.refresh();
    } catch {
      const message = "Erreur réseau lors de la connexion.";
      setError(message);
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="god-mode-login-wrap">
      <div className="god-mode-login-card card-default mx-auto w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-3">
          <span className="god-mode-badge" aria-hidden>
            <ShieldAlert size={20} strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-h1">God Mode</h1>
            <p className="text-secondary mt-1 text-sm">
              Accès réservé au développeur ID FOOT.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="god-email">Email développeur</FieldLabel>
            <InputWithIcon icon={Mail}>
              <input
                id="god-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input w-full"
                autoComplete="username"
                required
              />
            </InputWithIcon>
          </div>

          <div>
            <FieldLabel htmlFor="god-password">Mot de passe</FieldLabel>
            <div className="relative mt-1.5">
              <InputWithIcon icon={LogIn}>
                <input
                  id="god-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input w-full pr-10"
                  autoComplete="current-password"
                  required
                />
              </InputWithIcon>
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError message={error ?? undefined} />
          </div>

          <PrimaryButton type="submit" icon={LogIn} loading={submitting} className="w-full">
            Entrer en god-mode
          </PrimaryButton>
        </form>

        <p className="text-secondary mt-6 text-center text-xs">
          <Link href="/" className="hover:text-navy">
            Retour à l&apos;accueil public
          </Link>
        </p>
      </div>
    </div>
  );
}

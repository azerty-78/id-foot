"use client";

import { ArrowLeft, Eye, EyeOff, LogIn, Mail, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import {
  FieldLabel,
  InputWithIcon,
  PrimaryButton,
} from "@/components/admin/ui";
import { AppLogo } from "@/components/brand/AppLogo";
import { useToast } from "@/components/providers/ToastProvider";
import { ADMIN_COMPETITION_HOME } from "@/lib/competitionSlug";

type CompetitionPreview = {
  nom: string;
  annee: number;
  lieu: string | null;
  image: string | null;
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const competitionSlug = searchParams.get("competition") ?? "";
  const callbackUrl = competitionSlug
    ? ADMIN_COMPETITION_HOME
    : (searchParams.get("callbackUrl") ?? ADMIN_COMPETITION_HOME);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [competition, setCompetition] = useState<CompetitionPreview | null>(
    null,
  );
  const [competitionLoading, setCompetitionLoading] = useState(false);

  const backHref = competitionSlug ? `/${competitionSlug}` : "/";
  const backLabel = competitionSlug
    ? "Retour à la compétition"
    : "Retour à l'accueil";

  useEffect(() => {
    if (!competitionSlug) {
      setCompetition(null);
      return;
    }

    let cancelled = false;
    setCompetitionLoading(true);

    void fetch(
      `/api/competitions/by-slug/${encodeURIComponent(competitionSlug)}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CompetitionPreview | null) => {
        if (!cancelled) {
          setCompetition(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompetitionLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [competitionSlug]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        competitionSlug,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const message = competitionSlug
          ? "Connexion impossible. Vérifiez vos identifiants pour cette compétition."
          : "Connexion impossible. Vérifiez vos identifiants.";
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

  function renderLeadText() {
    if (!competitionSlug) {
      return "Accédez à l'espace d'administration ID FOOT.";
    }

    if (competitionLoading) {
      return "Chargement de la compétition…";
    }

    if (competition) {
      return (
        <>
          Connectez-vous pour administrer{" "}
          <span className="login-competition-name">{competition.nom}</span>.
        </>
      );
    }

    return "Connectez-vous pour administrer cette compétition.";
  }

  function renderCardLogo() {
    if (competition?.image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={competition.image}
          alt={competition.nom}
          className="login-card-header-logo login-card-header-logo--competition"
        />
      );
    }

    return <AppLogo size="lg" />;
  }

  return (
    <div className="login-page">
      <header className="login-page-header">
        <div className="login-page-header-inner">
          <Link href={backHref} className="login-page-back">
            <ArrowLeft size={16} aria-hidden />
            <span>{backLabel}</span>
          </Link>
          <AppLogo href="/" size="sm" />
        </div>
      </header>

      <main className="login-page-main">
        <div className="login-card">
          <header className="login-card-header">
            {renderCardLogo()}
          </header>

          <p className="text-section-label">Administration</p>
          <h1 className="text-h2 mt-2">
            {competition
              ? `Se connecter pour gérer ${competition.nom}`
              : "Connexion"}
          </h1>
          <p className="login-card-lead">{renderLeadText()}</p>

          {competitionSlug && competition ? (
            <div className="login-competition-badge">
              <div className="login-competition-badge-icon" aria-hidden>
                <Trophy size={20} />
              </div>
              <div className="login-competition-badge-body">
                <p className="login-competition-badge-name">{competition.nom}</p>
                <p className="login-competition-badge-meta">
                  <span>{competition.annee}</span>
                  {competition.lieu ? (
                    <>
                      <span aria-hidden>·</span>
                      <MapPin size={12} aria-hidden />
                      <span>{competition.lieu}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="login-card-form">
            {error ? (
              <div className="login-form-error" role="alert">
                {error}
              </div>
            ) : null}

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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
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
              {submitting ? "Connexion…" : "Se connecter"}
            </PrimaryButton>

            <Link href="#" className="login-forgot">
              Mot de passe oublié ?
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppLogo } from "@/components/brand/AppLogo";
import { PrimaryLink } from "@/components/admin/ui";
import type { LucideIcon } from "lucide-react";

export type CompetitionBranding = {
  nom: string;
  abbreviation: string;
  slug: string;
  image?: string | null;
};

type PublicHeaderProps = {
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  branding?: CompetitionBranding;
};

export function PublicHeader({
  action,
  backHref,
  backLabel,
  branding,
}: PublicHeaderProps) {
  const logoHref = branding ? `/${branding.slug}` : "/";
  const logoAlt = branding?.abbreviation ?? "ID FOOT";
  const logoSrc = branding?.image ?? undefined;

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <div className="home-header-start">
          {backHref ? (
            <Link href={backHref} className="home-header-back">
              <ArrowLeft size={16} aria-hidden />
              <span>{backLabel ?? "Retour"}</span>
            </Link>
          ) : null}
          <div className="home-header-brand">
            <AppLogo
              href={logoHref}
              size="md"
              className="sm:hidden"
              src={logoSrc}
              alt={logoAlt}
            />
            <AppLogo
              href={logoHref}
              size="lg"
              className="hidden sm:block"
              src={logoSrc}
              alt={logoAlt}
            />
            {branding ? (
              <div className="home-header-brand-text">
                <span className="home-header-brand-abbr">{branding.abbreviation}</span>
                <span className="home-header-brand-name">{branding.nom}</span>
              </div>
            ) : null}
          </div>
        </div>

        {action ? <div className="home-header-actions">{action}</div> : null}
      </div>
    </header>
  );
}

type PublicFooterProps = {
  branding?: CompetitionBranding;
};

export function PublicFooter({ branding }: PublicFooterProps) {
  const year = new Date().getFullYear();
  const brandLabel = branding?.abbreviation ?? "ID FOOT";

  return (
    <footer className="site-footer">
      <div className="site-footer-inner site-footer-inner--compact">
        <div className="site-footer-brand">
          <AppLogo
            size="sm"
            src={branding?.image ?? undefined}
            alt={brandLabel}
          />
          <p className="site-footer-tagline">
            {branding ? (
              <>
                Plateforme officielle de gestion des licences et du contrôle
                d&apos;accès pour la compétition{" "}
                <strong>{branding.nom}</strong>.
              </>
            ) : (
              "Système d'identification et de gestion des licences joueurs."
            )}
          </p>
        </div>
        <div className="site-footer-meta">
          <p className="site-footer-copy">
            © {year} KOBE Corporation · {brandLabel} — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}

type HeaderActionLinkProps = {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function PublicHeaderActionLink({
  href,
  icon,
  children,
  className = "",
}: HeaderActionLinkProps) {
  return (
    <PrimaryLink href={href} icon={icon} size="sm" className={className}>
      {children}
    </PrimaryLink>
  );
}

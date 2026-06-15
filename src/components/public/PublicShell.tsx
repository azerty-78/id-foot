import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppLogo } from "@/components/brand/AppLogo";
import { PrimaryLink } from "@/components/admin/ui";
import type { LucideIcon } from "lucide-react";

type PublicHeaderProps = {
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PublicHeader({ action, backHref, backLabel }: PublicHeaderProps) {
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
          <AppLogo href="/" size="md" className="sm:hidden" />
          <AppLogo href="/" size="lg" className="hidden sm:block" />
        </div>

        {action ? <div className="home-header-actions">{action}</div> : null}
      </div>
    </header>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner site-footer-inner--compact">
        <div className="site-footer-brand">
          <AppLogo size="sm" />
          <p className="site-footer-tagline">
            Système d&apos;identification et de gestion des licences joueurs.
          </p>
        </div>
        <div className="site-footer-meta">
          <p className="site-footer-copy">
            © {year} KOBE Corporation · ID FOOT — Tous droits réservés
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

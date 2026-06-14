import { LayoutDashboard, LogIn, QrCode } from "lucide-react";
import { AppLogo } from "@/components/brand/AppLogo";
import { OutlineLink, PrimaryLink, SecondaryLink } from "@/components/admin/ui";

const footerLinks = [
  { label: "Administration", href: "/admin/dashboard" },
  { label: "Scanner QR", href: "/admin/scanner" },
  { label: "Joueurs", href: "/admin/players" },
  { label: "Compétitions", href: "/admin/competitions" },
];

const featureCards = [
  {
    title: "Scanner QR",
    text: "Contrôle d'accès rapide en compétition — validez chaque joueur en un scan.",
    href: "/admin/scanner",
    featured: true,
  },
  {
    title: "Joueurs",
    text: "Fiches complètes, photo, téléphone et numéro de maillot.",
    href: "/admin/players",
  },
  {
    title: "Clubs",
    text: "Équipes rattachées aux compétitions avec effectifs.",
    href: "/admin/teams",
  },
  {
    title: "Compétitions",
    text: "Organisation des tournois et saisons.",
    href: "/admin/competitions",
  },
  {
    title: "Cartes licence",
    text: "PDF imprimable et QR code par joueur.",
    href: "/admin/players/new",
  },
];

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <div className="home-shell flex min-h-[100dvh] flex-col">
      <header className="home-header">
        <div className="home-header-inner">
          <AppLogo href="/" size="md" className="sm:hidden" />
          <AppLogo href="/" size="lg" className="hidden sm:block" />

          <div className="home-header-actions">
            <SecondaryLink href="/admin/signin" icon={LogIn} size="sm" className="hidden sm:inline-flex">
              Connexion
            </SecondaryLink>
            <PrimaryLink href="/admin/scanner" icon={QrCode} size="sm" className="home-scan-cta">
              Scanner
            </PrimaryLink>
          </div>
        </div>
      </header>

      <main className="home-main flex-1">
        <div className="home-hero">
          <div className="home-hero-content">
            <p className="text-section-label">KOBE Corporation</p>
            <h1 className="text-h1 home-hero-title">
              Licences joueurs & contrôle QR en compétition
            </h1>
            <p className="text-body home-hero-text">
              Scannez les QR codes à l&apos;entrée du terrain, validez les joueurs
              instantanément et gérez compétitions, clubs et effectifs.
            </p>

            <div className="home-hero-actions">
              <PrimaryLink href="/admin/scanner" icon={QrCode} className="w-full sm:w-auto">
                Lancer le scanner QR
              </PrimaryLink>
              <OutlineLink href="/admin/dashboard" icon={LayoutDashboard} className="w-full sm:w-auto">
                Administration
              </OutlineLink>
            </div>
          </div>

          <div className="home-feature-grid">
            {featureCards.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`home-feature-card ${item.featured ? "home-feature-card--scan" : ""}`}
              >
                {item.featured && (
                  <span className="home-feature-badge">
                    <QrCode size={12} aria-hidden />
                    Priorité terrain
                  </span>
                )}
                <h2 className="text-h3">{item.title}</h2>
                <p className="text-body mt-2">{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <AppLogo size="sm" />
            <p className="site-footer-tagline">
              Système d&apos;identification et de gestion des licences joueurs.
            </p>
          </div>

          <nav className="site-footer-nav" aria-label="Navigation pied de page">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="site-footer-link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="site-footer-meta">
            <p className="site-footer-copy">
              © {year} KOBE Corporation · ID FOOT — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

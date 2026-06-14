import { AppLogo } from "@/components/brand/AppLogo";
import { PrimaryLink, OutlineLink, SecondaryLink } from "@/components/admin/ui";

export default function HomePage() {
  return (
    <div className="admin-shell flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <AppLogo href="/" size="lg" />

          <div className="flex items-center gap-2 sm:gap-3">
            <SecondaryLink href="/admin/signin" className="hidden sm:inline-flex">
              Connexion
            </SecondaryLink>
            <PrimaryLink href="/admin/dashboard" className="hidden sm:inline-flex">
              Administration
            </PrimaryLink>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-section-label">KOBE Corporation</p>
            <h1 className="text-h1 mt-4 max-w-xl">
              Gérez les licences de vos joueurs en toute simplicité
            </h1>
            <p className="text-body mt-5 max-w-xl">
              Enregistrez les joueurs, générez leurs cartes PDF, scannez les QR codes
              et administrez compétitions, clubs et effectifs depuis une interface unique.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/admin/dashboard" className="w-full sm:w-auto">
                Accéder à l&apos;administration
              </PrimaryLink>
              <OutlineLink href="/admin/scanner" className="w-full sm:w-auto">
                Scanner un QR code
              </OutlineLink>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
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
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="admin-card block rounded-[var(--radius-xl)] p-5 transition hover:-translate-y-0.5 hover:border-green/30 hover:shadow-lg"
              >
                <h2 className="text-h3">{item.title}</h2>
                <p className="text-body mt-2">{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

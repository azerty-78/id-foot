import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/admin/ui";

export default function HomePage() {
  return (
    <div className="admin-shell flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-lg font-black text-gold">
              ID
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Football ID</p>
              <p className="text-xs text-slate-500">Système d&apos;identification des joueurs</p>
            </div>
          </div>
          <Link href="/admin/dashboard" className="hidden sm:block">
            <PrimaryButton>Administration</PrimaryButton>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/70">
              KOBE Corporation
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Gérez les licences de vos joueurs en toute simplicité
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Enregistrez les joueurs, générez leurs cartes PDF, scannez les QR codes
              et administrez compétitions, clubs et effectifs depuis une interface unique.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/dashboard">
                <PrimaryButton className="w-full sm:w-auto">
                  Accéder à l&apos;administration
                </PrimaryButton>
              </Link>
              <Link href="/admin/scanner">
                <SecondaryButton className="w-full sm:w-auto">
                  Scanner un QR code
                </SecondaryButton>
              </Link>
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
              <Link
                key={item.href}
                href={item.href}
                className="admin-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

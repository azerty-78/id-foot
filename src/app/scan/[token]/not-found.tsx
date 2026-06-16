import Link from "next/link";
import { AppLogo } from "@/components/brand/AppLogo";

export default function ScanNotFound() {
  return (
    <div className="scan-gate-page">
      <header className="scan-gate-header">
        <AppLogo size="sm" />
      </header>

      <main className="scan-gate-main">
        <div className="card-default scan-gate-card text-center">
          <h1 className="text-h2">QR code invalide</h1>
          <p className="scan-gate-lead">
            Aucun joueur ne correspond à ce code. Vérifiez la carte ou contactez
            l&apos;organisateur.
          </p>
          <Link href="/" className="btn btn-outline btn-sm">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}

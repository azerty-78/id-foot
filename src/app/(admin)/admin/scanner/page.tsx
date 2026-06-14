import { ScannerWorkspace } from "@/components/admin/scanner/ScannerWorkspace";

export default function ScannerPage() {
  return (
    <div className="scanner-page">
      <div className="scanner-page-header">
        <p className="text-section-label">Contrôle d&apos;accès</p>
        <h1 className="text-h1 mt-1">Scanner QR</h1>
        <p className="text-body mt-1">
          Validez les joueurs en compétition — scan rapide, enchaînement fluide.
        </p>
      </div>
      <ScannerWorkspace />
    </div>
  );
}

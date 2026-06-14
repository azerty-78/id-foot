import { PageHeader } from "@/components/admin/ui";
import { ScannerWorkspace } from "@/components/admin/scanner/ScannerWorkspace";

export default function ScannerPage() {
  return (
    <div>
      <PageHeader
        title="Scanner QR"
        description="Contrôle d'accès rapide pour les compétitions — scannez, validez, enchaînez."
      />
      <ScannerWorkspace />
    </div>
  );
}

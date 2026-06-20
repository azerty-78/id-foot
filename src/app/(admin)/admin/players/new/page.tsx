"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { PlayerForm } from "@/components/admin/PlayerForm";

export default function NewPlayerPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Ajouter une licence"
        description="Créez un joueur ou un membre du personnel (staff). Photo et club obligatoires. Le personnel reçoit une carte distincte avec QR code, sans numéro de maillot."
      />

      <PlayerForm
        mode="create"
        cancelHref="/admin/players"
        onSuccess={() => router.push("/admin/players")}
      />
    </div>
  );
}

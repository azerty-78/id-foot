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
        description="Créez un joueur, un membre du personnel (staff) ou de la commission d'organisation. Photo et club obligatoires. Personnel et commission reçoivent une carte distincte avec QR code, sans numéro de maillot."
      />

      <PlayerForm
        mode="create"
        cancelHref="/admin/players"
        onSuccess={() => router.push("/admin/players")}
      />
    </div>
  );
}

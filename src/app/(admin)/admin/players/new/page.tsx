"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { PlayerForm } from "@/components/admin/PlayerForm";

export default function NewPlayerPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Ajouter un joueur"
        description="Renseignez les informations du joueur. Seuls le nom, prénom, date de naissance, numéro de maillot, poste et club sont obligatoires."
      />

      <PlayerForm
        mode="create"
        cancelHref="/admin/players"
        onSuccess={() => router.push("/admin/players")}
      />
    </div>
  );
}

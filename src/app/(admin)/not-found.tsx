import { NotFoundView } from "@/components/admin/NotFoundView";

export default function AdminNotFound() {
  return (
    <NotFoundView
      description="Cette section d'administration n'existe pas ou l'URL est incorrecte."
      secondaryHref="/admin/players"
      secondaryLabel="Voir les joueurs"
    />
  );
}

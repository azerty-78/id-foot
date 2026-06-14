import { NotFoundView } from "@/components/admin/NotFoundView";

export default function NotFound() {
  return (
    <NotFoundView
      homeHref="/"
      homeLabel="Retour à l'accueil"
      secondaryHref="/admin/dashboard"
      secondaryLabel="Ouvrir l'administration"
    />
  );
}

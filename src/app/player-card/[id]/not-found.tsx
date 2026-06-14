import { NotFoundView } from "@/components/admin/NotFoundView";

export default function PlayerCardNotFound() {
  return (
    <NotFoundView
      title="Carte joueur introuvable"
      description="Aucun joueur ne correspond à cet identifiant. Vérifiez le lien ou scannez à nouveau le QR code."
      homeHref="/admin/scanner"
      homeLabel="Ouvrir le scanner"
      secondaryHref="/admin/players"
      secondaryLabel="Liste des joueurs"
    />
  );
}

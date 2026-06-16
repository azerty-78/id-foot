"use client";

import {
  Download,
  Eye,
  Pencil,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { usePlayer } from "@/hooks/useApi";
import { PlayerIdentityCard } from "@/components/admin/PlayerIdentityCard";
import {
  PlayerLicenseCard,
  type PlayerLicenseCardPlayer,
} from "@/components/admin/PlayerLicenseCard";
import {
  AdminCard,
  AdminTable,
  DangerButton,
  GhostButton,
  LoadingState,
  OutlineButton,
  OutlineLink,
  PrimaryButton,
} from "@/components/admin/ui";
import { downloadPdfFromApi } from "@/lib/downloadPdfClient";
import { buildPlayerCardFilename } from "@/lib/playerCardFilename";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("fr-FR");
}

type PlayerDetailViewProps = {
  id: string;
};

export function PlayerDetailView({ id }: PlayerDetailViewProps) {
  const router = useRouter();
  const { player, loading, error } = usePlayer(id);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  async function handleDownloadCard() {
    if (!player) return;

    setDownloadingCard(true);
    try {
      await downloadPdfFromApi(
        `/api/players/${player.id}/card`,
        buildPlayerCardFilename(player.prenom, player.nom),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDownloadingCard(false);
    }
  }

  function handlePrintPreview() {
    closePreview();
    window.setTimeout(() => window.print(), 150);
  }

  async function handleDelete() {
    if (!player) return;

    const fullName = `${player.prenom} ${player.nom}`;

    if (!window.confirm(`Supprimer le joueur ${fullName} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la suppression.");
      }

      router.push("/admin/players");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  if (loading) {
    return <LoadingState message="Chargement du joueur..." />;
  }

  if (error || !player) {
    return (
      <AdminCard className="px-6 py-10 text-center">
        <p className="text-sm text-rose-700">{error ?? "Joueur introuvable."}</p>
      </AdminCard>
    );
  }

  const qrValue = `${appUrl}/api/qr/${player.qrToken}`;

  const licensePlayer: PlayerLicenseCardPlayer = {
    id: player.id,
    nom: player.nom,
    prenom: player.prenom,
    numero: player.numero,
    poste: player.poste,
    photo: player.photo,
    qrToken: player.qrToken,
    equipe: {
      nom: player.equipe.nom,
      competition: {
        nom: player.equipe.competition.nom,
        image: player.equipe.competition.image,
        abbreviation: player.equipe.competition.abbreviation,
        fullControl: player.equipe.competition.fullControl,
      },
    },
  };

  const details = [
    { label: "ID", value: player.id },
    { label: "Prénom", value: player.prenom },
    { label: "Nom", value: player.nom },
    { label: "Date de naissance", value: formatDate(player.dateNaissance) },
    { label: "Nationalité", value: player.nationalite ?? "—" },
    { label: "Sexe", value: player.sexe ?? "—" },
    { label: "Téléphone", value: player.telephone ?? "—" },
    { label: "Numéro de maillot", value: player.numero != null ? String(player.numero) : "—" },
    { label: "Poste", value: player.poste ?? "—" },
    { label: "Photo", value: player.photo ?? "—" },
    { label: "QR Token", value: player.qrToken },
    { label: "Équipe", value: player.equipe.nom },
    { label: "Compétition", value: player.equipe.competition.nom },
    { label: "Année compétition", value: String(player.equipe.competition.annee) },
    { label: "Lieu compétition", value: player.equipe.competition.lieu ?? "—" },
    { label: "Créé le", value: formatDateTime(player.createdAt) },
    { label: "Mis à jour le", value: formatDateTime(player.updatedAt) },
  ];

  return (
    <div className="print:block">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-4 print:hidden">
          <PlayerIdentityCard
            prenom={player.prenom}
            nom={player.nom}
            numero={player.numero ?? ""}
            poste={player.poste ?? ""}
            equipe={player.equipe.nom}
            photo={player.photo}
            qrValue={qrValue}
            competition={player.equipe.competition.nom}
            competitionLogo={player.equipe.competition.image}
          />

          <div className="flex flex-wrap gap-2">
            <OutlineButton
              type="button"
              icon={Eye}
              onClick={() => setIsPreviewOpen(true)}
              className="w-full sm:w-auto"
            >
              Aperçu carte
            </OutlineButton>
            <PrimaryButton
              type="button"
              icon={Download}
              loading={downloadingCard}
              onClick={() => void handleDownloadCard()}
              className="w-full sm:w-auto"
            >
              Télécharger la carte PDF
            </PrimaryButton>
            <OutlineButton
              type="button"
              icon={Printer}
              onClick={() => window.print()}
            >
              Imprimer
            </OutlineButton>
          </div>
        </div>

        <AdminCard className="print:shadow-none">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand/60">
                Fiche joueur
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Informations détaillées
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <OutlineLink href={`/admin/players/${player.id}/edit`} icon={Pencil}>
                Modifier
              </OutlineLink>
              <DangerButton type="button" icon={Trash2} onClick={handleDelete}>
                Supprimer
              </DangerButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-md)] border border-gray-100">
            <AdminTable>
              <tbody>
                {details.map((row) => (
                  <tr key={row.label}>
                    <th className="w-1/3 bg-gray-50 font-medium text-gray-600">
                      {row.label}
                    </th>
                    <td className="break-all">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </div>
        </AdminCard>
      </div>

      <AdminModal
        open={isPreviewOpen}
        title={`Carte licence — ${player.prenom} ${player.nom}`}
        onClose={closePreview}
        historyKey={`player-card-preview-${player.id}`}
        panelClassName="modal-panel--card-preview"
        busy={downloadingCard}
        footer={
          <>
            <GhostButton
              type="button"
              icon={X}
              size="sm"
              onClick={closePreview}
              disabled={downloadingCard}
            >
              Fermer
            </GhostButton>
            <OutlineButton
              type="button"
              icon={Printer}
              size="sm"
              onClick={handlePrintPreview}
              disabled={downloadingCard}
            >
              Imprimer
            </OutlineButton>
            <PrimaryButton
              type="button"
              icon={Download}
              size="sm"
              loading={downloadingCard}
              onClick={() => void handleDownloadCard()}
            >
              Télécharger PDF
            </PrimaryButton>
          </>
        }
      >
        <div className="player-card-preview-wrap">
          <PlayerLicenseCard
            player={licensePlayer}
            hideActions
            className="player-license-card--preview"
          />
        </div>
      </AdminModal>
    </div>
  );
}

"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PlayerLicenseCard } from "@/components/admin/PlayerLicenseCard";
import { GhostButton, PrimaryButton } from "@/components/admin/ui";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { PREVIEW_PLAYER_LICENSE } from "@/lib/playerCardMock";

type PlayerCardPreviewSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function PlayerCardPreviewSheet({
  open,
  onClose,
}: PlayerCardPreviewSheetProps) {
  const [downloading, setDownloading] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

  async function handleDownload() {
    setDownloading(true);

    try {
      const res = await fetch("/api/players/card/preview");

      if (!res.ok) {
        throw new Error("Erreur lors du téléchargement du PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "carte-joueur-apercu.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="card-preview-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-preview-title"
    >
      <button
        type="button"
        className="card-preview-sheet-backdrop"
        aria-label="Fermer l'aperçu"
        onClick={onClose}
      />

      <div className="card-preview-sheet-panel">
        <div className="card-preview-sheet-header">
          <div className="min-w-0">
            <p id="card-preview-title" className="card-preview-sheet-title">
              Aperçu carte licence
            </p>
            <p className="card-preview-sheet-subtitle">
              Joueur fictif · outil temporaire design
            </p>
          </div>
          <GhostButton
            type="button"
            size="icon"
            icon={X}
            aria-label="Fermer"
            onClick={onClose}
          />
        </div>

        <div className="card-preview-sheet-body">
          <PlayerLicenseCard player={PREVIEW_PLAYER_LICENSE} compact />
        </div>

        <div className="card-preview-sheet-footer">
          <PrimaryButton
            type="button"
            icon={Download}
            loading={downloading}
            className="w-full"
            onClick={handleDownload}
          >
            Télécharger le PDF
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Download, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlayerLicenseCard } from "@/components/admin/PlayerLicenseCard";
import { GhostButton, PrimaryButton } from "@/components/admin/ui";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { buildPreviewCardFilename, parseContentDispositionFilename } from "@/lib/playerCardFilename";
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

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);

    try {
      const fallbackFilename = buildPreviewCardFilename();
      const res = await fetch("/api/players/card/preview");

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          detail?: string;
          error?: string;
        } | null;
        throw new Error(
          data?.detail ?? data?.error ?? "Erreur lors du téléchargement du PDF.",
        );
      }

      const filename = parseContentDispositionFilename(
        res.headers.get("Content-Disposition"),
        fallbackFilename,
      );
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("[PlayerCardPreviewSheet] download failed", error);
    } finally {
      setDownloading(false);
    }
  }, []);

  if (!open) return null;

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

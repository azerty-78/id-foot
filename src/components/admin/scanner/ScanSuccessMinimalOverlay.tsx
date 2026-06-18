"use client";

import {
  ArrowRight,
  BadgeCheck,
  ScanLine,
} from "lucide-react";
import { useEffect } from "react";
import { PrimaryButton } from "@/components/admin/ui";

type ScanSuccessMinimalOverlayProps = {
  validatedCount: number;
  onNextScan: () => void;
};

export function ScanSuccessMinimalOverlay({
  validatedCount,
  onNextScan,
}: ScanSuccessMinimalOverlayProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        onNextScan();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNextScan]);

  return (
    <div className="scan-success-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-success-title">
      <div className="scan-success-panel">
        <div className="scan-success-badge">
          <span className="scan-success-icon" aria-hidden>
            <BadgeCheck size={28} strokeWidth={2} />
          </span>
          <div>
            <p id="scan-success-title" className="scan-success-title">
              Joueur authentifié
            </p>
            <p className="scan-success-subtitle">
              Licence valide · vous pouvez scanner le joueur suivant
            </p>
          </div>
        </div>

        <PrimaryButton
          type="button"
          icon={ScanLine}
          onClick={onNextScan}
          className="scan-next-btn w-full"
        >
          Scanner le suivant
          <kbd className="scan-kbd">Entrée</kbd>
        </PrimaryButton>

        <p className="scan-success-session">
          <ArrowRight size={14} aria-hidden />
          {validatedCount} joueur{validatedCount > 1 ? "s" : ""} validé
          {validatedCount > 1 ? "s" : ""} cette session
        </p>
      </div>
    </div>
  );
}

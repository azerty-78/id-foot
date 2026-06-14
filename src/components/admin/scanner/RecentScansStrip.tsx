"use client";

import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { GhostButton } from "@/components/admin/ui";
import type { RecentScan } from "./types";

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

type RecentScansStripProps = {
  scans: RecentScan[];
  onReset: () => void;
};

export function RecentScansStrip({ scans, onReset }: RecentScansStripProps) {
  if (scans.length === 0) return null;

  return (
    <section className="scan-recent" aria-label="Derniers joueurs validés">
      <div className="scan-recent-header">
        <p className="scan-recent-label">Derniers validés</p>
        <GhostButton
          type="button"
          icon={RotateCcw}
          size="sm"
          className="scan-recent-reset"
          onClick={onReset}
        >
          Réinitialiser
        </GhostButton>
      </div>
      <div className="scan-recent-list">
        {scans.map((scan) => (
          <div key={`${scan.id}-${scan.validatedAt}`} className="scan-recent-item">
            {scan.photo ? (
              <Image
                src={scan.photo}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="scan-recent-photo"
              />
            ) : (
              <span className="scan-recent-avatar">
                {getInitials(scan.prenom, scan.nom)}
              </span>
            )}
            <span className="scan-recent-name">
              {scan.prenom} {scan.nom.charAt(0)}.
            </span>
            <span className="scan-recent-num">#{scan.numero}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

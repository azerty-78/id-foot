import Image from "next/image";
import type { RecentScan } from "./types";

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function RecentScansStrip({ scans }: { scans: RecentScan[] }) {
  if (scans.length === 0) return null;

  return (
    <section className="scan-recent" aria-label="Derniers joueurs validés">
      <p className="scan-recent-label">Derniers validés</p>
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

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

type PlayerIdentityCardProps = {
  prenom: string;
  nom: string;
  numero: number | string;
  poste: string;
  equipe: string;
  photo?: string | null;
  qrValue?: string;
  className?: string;
};

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function PlayerIdentityCard({
  prenom,
  nom,
  numero,
  poste,
  equipe,
  photo,
  qrValue,
  className = "",
}: PlayerIdentityCardProps) {
  const displayName = [prenom, nom].filter(Boolean).join(" ").trim() || "Joueur";
  const numeroStr = String(numero);

  return (
    <div className={`card-navy relative overflow-hidden ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1 select-none text-[36px] font-bold leading-none text-white opacity-[0.06]"
      >
        {numeroStr.padStart(2, "0")}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[rgba(57,231,95,0.07)]"
      />

      <div className="relative flex gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={displayName}
            width={52}
            height={52}
            unoptimized
            className="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-green object-cover"
          />
        ) : (
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-green bg-navy-700 text-sm font-semibold text-white">
            {getInitials(prenom || "?", nom || "?")}
          </div>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[14px] font-medium leading-tight text-white">
            {displayName}
          </p>
          <p className="mt-1 text-[12px] font-medium text-green">
            {poste || "—"}
            {numeroStr ? ` · #${numeroStr}` : ""}
          </p>
          <p className="mt-1 truncate text-[11px] text-[rgba(255,255,255,0.45)]">
            {equipe || "—"}
          </p>
        </div>
      </div>

      {qrValue && (
        <div className="relative mt-4 flex justify-end">
          <div className="rounded-[var(--radius-sm)] bg-white p-1">
            <QRCodeSVG value={qrValue} size={44} level="M" />
          </div>
        </div>
      )}
    </div>
  );
}

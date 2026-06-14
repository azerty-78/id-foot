import Image from "next/image";
import { BrandedQrCode } from "@/components/qr/BrandedQrCode";

type PlayerIdentityCardProps = {
  prenom: string;
  nom: string;
  numero: number | string | null;
  poste: string | null;
  equipe: string;
  photo?: string | null;
  qrValue?: string;
  competition?: string;
  layout?: "row" | "column";
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
  competition,
  layout = "row",
  className = "",
}: PlayerIdentityCardProps) {
  const displayName = [prenom, nom].filter(Boolean).join(" ").trim() || "Joueur";
  const numeroStr = numero != null && numero !== "" ? String(numero) : "";
  const isColumn = layout === "column";

  return (
    <div
      className={`card-navy relative overflow-hidden ${
        isColumn ? "player-identity-card--column" : ""
      } ${className}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute select-none font-bold leading-none text-white opacity-[0.06] ${
          isColumn
            ? "right-4 top-2 text-[48px]"
            : "right-3 top-1 text-[36px]"
        }`}
      >
        {numeroStr.padStart(2, "0")}
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute rounded-full bg-[rgba(57,231,95,0.07)] ${
          isColumn ? "-right-8 -top-8 h-32 w-32" : "-right-6 -top-6 h-24 w-24"
        }`}
      />

      <div
        className={`relative flex ${
          isColumn ? "flex-col items-center gap-4 text-center" : "gap-3"
        }`}
      >
        {photo ? (
          <Image
            src={photo}
            alt={displayName}
            width={isColumn ? 112 : 52}
            height={isColumn ? 112 : 52}
            unoptimized
            className={`shrink-0 rounded-full border-2 border-green object-cover ${
              isColumn ? "h-28 w-28" : "h-[52px] w-[52px]"
            }`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full border-2 border-green bg-navy-700 font-semibold text-white ${
              isColumn ? "h-28 w-28 text-2xl" : "h-[52px] w-[52px] text-sm"
            }`}
          >
            {getInitials(prenom || "?", nom || "?")}
          </div>
        )}

        <div className={isColumn ? "w-full" : "min-w-0 flex-1 pt-0.5"}>
          <p
            className={`font-medium leading-tight text-white ${
              isColumn ? "text-[18px] font-bold" : "truncate text-[14px]"
            }`}
          >
            {displayName}
          </p>
          <p className={`font-medium text-green ${isColumn ? "mt-2 text-sm" : "mt-1 text-[12px]"}`}>
            {poste || "—"}
            {numeroStr ? ` · #${numeroStr}` : ""}
          </p>
          <p
            className={`text-[rgba(255,255,255,0.45)] ${
              isColumn
                ? "mt-1.5 text-xs"
                : "mt-1 truncate text-[11px]"
            }`}
          >
            {equipe || "—"}
          </p>
          {competition && (
            <p
              className={`text-[rgba(255,255,255,0.45)] ${
                isColumn ? "mt-1 text-xs" : "mt-1 text-[11px]"
              }`}
            >
              {competition}
            </p>
          )}
        </div>
      </div>

      {qrValue && (
        <div className="relative mt-4 flex justify-end">
          <div className="rounded-[var(--radius-sm)] bg-white p-1">
            <BrandedQrCode value={qrValue} size={44} />
          </div>
        </div>
      )}
    </div>
  );
}

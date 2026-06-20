import Image from "next/image";
import { BrandedQrCode } from "@/components/qr/BrandedQrCode";
import { isPersonnelLicense } from "@/types/player";

type PlayerIdentityCardProps = {
  prenom: string;
  nom: string;
  numero: number | string | null;
  poste: string | null;
  licenseType?: string | null;
  fonctionPersonnel?: string | null;
  equipe: string;
  photo?: string | null;
  qrValue?: string;
  competition?: string;
  competitionLogo?: string | null;
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
  licenseType,
  fonctionPersonnel,
  equipe,
  photo,
  qrValue,
  competition,
  competitionLogo,
  layout = "row",
  className = "",
}: PlayerIdentityCardProps) {
  const displayName = [prenom, nom].filter(Boolean).join(" ").trim() || "Joueur";
  const isPersonnel = isPersonnelLicense(licenseType);
  const numeroStr = !isPersonnel && numero != null && numero !== "" ? String(numero) : "";
  const roleLine = isPersonnel
    ? fonctionPersonnel?.trim() || "Personnel"
    : `${poste || "—"}${numeroStr ? ` · #${numeroStr}` : ""}`;
  const isColumn = layout === "column";

  return (
    <div
      className={`card-navy relative overflow-hidden ${
        isPersonnel ? "player-identity-card--personnel" : ""
      } ${isColumn ? "player-identity-card--column" : ""} ${className}`}
    >
      {numeroStr ? (
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
      ) : null}

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
          <p className={`font-medium ${isPersonnel ? "text-[#d4a853]" : "text-green"} ${isColumn ? "mt-2 text-sm" : "mt-1 text-[12px]"}`}>
            {roleLine}
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
          <div className="player-identity-card-qr rounded-[var(--radius-sm)] bg-white">
            <BrandedQrCode
              value={qrValue}
              size={isColumn ? 88 : 72}
              competitionLogo={competitionLogo}
            />
          </div>
        </div>
      )}
    </div>
  );
}

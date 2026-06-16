"use client";

import { BrandedQrCode } from "@/components/qr/BrandedQrCode";
import { buildQrScanUrl } from "@/lib/qrScanUrl";

type PlayerCardQrProps = {
  token: string;
  size?: number;
  competitionLogo?: string | null;
};

export function PlayerCardQr({
  token,
  size = 70,
  competitionLogo,
}: PlayerCardQrProps) {
  const value = buildQrScanUrl(token);

  return (
    <BrandedQrCode
      value={value}
      size={size}
      competitionLogo={competitionLogo}
    />
  );
}

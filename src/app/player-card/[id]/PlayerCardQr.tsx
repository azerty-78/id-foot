"use client";

import { BrandedQrCode } from "@/components/qr/BrandedQrCode";

type PlayerCardQrProps = {
  token: string;
  size?: number;
};

export function PlayerCardQr({ token, size = 70 }: PlayerCardQrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const value = `${appUrl}/api/qr/${token}`;

  return <BrandedQrCode value={value} size={size} />;
}

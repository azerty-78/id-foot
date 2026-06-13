"use client";

import { QRCodeSVG } from "qrcode.react";

type PlayerCardQrProps = {
  token: string;
  size?: number;
};

export function PlayerCardQr({ token, size = 70 }: PlayerCardQrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const value = `${appUrl}/api/qr/${token}`;

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      bgColor="#ffffff"
      fgColor="#000000"
    />
  );
}

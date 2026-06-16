"use client";

import { QRCodeSVG } from "qrcode.react";
import { resolveQrLogoSrc } from "@/lib/qrLogo";
import { getQrLogoSize, QR_ERROR_CORRECTION } from "@/lib/qrBrand";

type BrandedQrCodeProps = {
  value: string;
  size?: number;
  className?: string;
  /** Logo compétition ; repli ID FOOT si absent. */
  competitionLogo?: string | null;
};

export function BrandedQrCode({
  value,
  size = 70,
  className = "",
  competitionLogo,
}: BrandedQrCodeProps) {
  const logoSize = getQrLogoSize(size);
  const logoSrc = resolveQrLogoSrc(competitionLogo);

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level={QR_ERROR_CORRECTION}
      bgColor="#ffffff"
      fgColor="#000000"
      className={className}
      imageSettings={{
        src: logoSrc,
        height: logoSize,
        width: logoSize,
        excavate: true,
      }}
    />
  );
}

"use client";

import { QRCodeSVG } from "qrcode.react";
import { brandAssets } from "@/lib/brand";
import { getQrLogoSize, QR_ERROR_CORRECTION } from "@/lib/qrBrand";

type BrandedQrCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

export function BrandedQrCode({
  value,
  size = 70,
  className = "",
}: BrandedQrCodeProps) {
  const logoSize = getQrLogoSize(size);
  const logoSrc = size < 72 ? brandAssets.icon : brandAssets.qrLogo;

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

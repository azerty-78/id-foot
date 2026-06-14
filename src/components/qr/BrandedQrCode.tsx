"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { brandAssets, getBrandAssetUrl } from "@/lib/brand";
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
  const [logoSrc, setLogoSrc] = useState<string>(brandAssets.qrLogo);

  useEffect(() => {
    setLogoSrc(getBrandAssetUrl(brandAssets.qrLogo));
  }, []);

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

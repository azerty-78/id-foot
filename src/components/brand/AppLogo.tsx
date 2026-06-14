import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/lib/brand";

type AppLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: { height: 42, width: 126 },
  md: { height: 54, width: 162 },
  lg: { height: 72, width: 216 },
  xl: { height: 88, width: 264 },
};

export function AppLogo({ href, size = "md", className = "" }: AppLogoProps) {
  const dim = sizes[size];

  const image = (
    <Image
      src={brandAssets.logo}
      alt="ID FOOT"
      width={dim.width}
      height={dim.height}
      priority
      className={`h-auto w-auto object-contain ${className}`}
      style={{ maxHeight: dim.height }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return image;
}

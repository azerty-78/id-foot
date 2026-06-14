import Image from "next/image";
import Link from "next/link";

type AppLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { height: 36, width: 108 },
  md: { height: 44, width: 132 },
  lg: { height: 56, width: 168 },
};

export function AppLogo({ href, size = "md", className = "" }: AppLogoProps) {
  const dim = sizes[size];

  const image = (
    <Image
      src="/logo.png"
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

import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src https: data: 'unsafe-inline' 'unsafe-eval'",
  "img-src https: data: blob:",
  "media-src https: data: blob:",
  "font-src https: data:",
  "connect-src https: wss:",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sharp"],
  images: {
    // Les assets /public servis tels quels — évite les échecs Sharp en Docker Alpine
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/admin/dashboard", permanent: true },
      { source: "/players", destination: "/admin/players", permanent: true },
      { source: "/players/:path*", destination: "/admin/players/:path*", permanent: true },
      { source: "/competitions", destination: "/admin/competitions", permanent: true },
      { source: "/teams", destination: "/admin/teams", permanent: true },
      { source: "/scanner", destination: "/admin/scanner", permanent: true },
    ];
  },
};

export default nextConfig;

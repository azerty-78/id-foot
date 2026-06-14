import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { brandAssets } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ID FOOT",
    template: "%s | ID FOOT",
  },
  description: "Système d'identification et de gestion des licences joueurs ID FOOT.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: brandAssets.icon, type: "image/png" }],
    apple: [
      {
        url: brandAssets.appleTouchIcon,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    title: "ID FOOT",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0d1b2a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

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
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: brandAssets.icon, sizes: "32x32", type: "image/png" },
      { url: brandAssets.icon512, sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: brandAssets.appleTouchIcon,
  },
  appleWebApp: {
    capable: true,
    title: "ID FOOT",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
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

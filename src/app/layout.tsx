import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ID FOOT",
    template: "%s | ID FOOT",
  },
  description: "Système d'identification et de gestion des licences joueurs ID FOOT.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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

export default function GodModeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="god-mode-root min-h-screen">{children}</div>;
}

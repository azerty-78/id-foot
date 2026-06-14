"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAdminBackPath } from "@/hooks/useAdminBackPath";

export function AdminBackButton({ className = "" }: { className?: string }) {
  const backPath = useAdminBackPath();

  if (!backPath) return null;

  return (
    <Link
      href={backPath}
      className={`btn btn-ghost btn-icon touch-target admin-back-btn ${className}`}
      aria-label="Retour"
    >
      <ArrowLeft size={18} strokeWidth={2} aria-hidden />
    </Link>
  );
}

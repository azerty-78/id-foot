"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminCard, GhostButton, PrimaryButton } from "@/components/admin/ui";

export default function SignOutPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    void signOut({ redirect: false }).then(() => {
      setDone(true);
    });
  }, []);

  return (
    <AdminCard className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        {done ? (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        )}
      </div>

      <h1 className="mt-5 text-xl font-bold text-slate-900">
        {done ? "Vous êtes déconnecté" : "Déconnexion en cours..."}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {done
          ? "Votre session a été fermée. Vous pouvez vous reconnecter à tout moment."
          : "Fermeture de la session en cours, veuillez patienter."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/admin/signin">
          <PrimaryButton className="w-full sm:w-auto">Se reconnecter</PrimaryButton>
        </Link>
        <Link href="/">
          <GhostButton className="w-full sm:w-auto">Retour à l&apos;accueil</GhostButton>
        </Link>
      </div>
    </AdminCard>
  );
}

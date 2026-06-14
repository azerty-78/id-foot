"use client";

import { AlertCircle } from "lucide-react";
import { GhostButton } from "@/components/admin/ui";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const isDbError =
    error.message.toLowerCase().includes("connect") ||
    error.message.toLowerCase().includes("econnrefused") ||
    error.message.toLowerCase().includes("database");

  return (
    <div className="card-default max-w-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-navy">
            {isDbError ? "Base de données inaccessible" : "Impossible de charger le dashboard"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isDbError
              ? "PostgreSQL n'est pas démarré. Lancez la base avec npm run docker:up, puis réessayez."
              : "Une erreur est survenue lors du chargement des statistiques."}
          </p>
          <div className="mt-4">
            <GhostButton type="button" onClick={reset}>
              Réessayer
            </GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}

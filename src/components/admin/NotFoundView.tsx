import { AppLogo } from "@/components/brand/AppLogo";
import { GhostLink, PrimaryLink } from "@/components/admin/ui";

type NotFoundViewProps = {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  code?: string;
};

export function NotFoundView({
  title = "Page introuvable",
  description = "La page que vous recherchez n'existe pas ou a été déplacée.",
  homeHref = "/admin/dashboard",
  homeLabel = "Retour au dashboard",
  secondaryHref,
  secondaryLabel,
  code = "404",
}: NotFoundViewProps) {
  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-4 py-16">
      <div className="admin-card w-full max-w-lg p-8 text-center sm:p-10">
        <p className="text-6xl font-black tracking-tight text-brand/15 sm:text-7xl">
          {code}
        </p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <PrimaryLink href={homeHref} className="w-full sm:w-auto">
            {homeLabel}
          </PrimaryLink>
          {secondaryHref && secondaryLabel && (
            <GhostLink href={secondaryHref} className="w-full sm:w-auto">
              {secondaryLabel}
            </GhostLink>
          )}
        </div>
      </div>
    </div>
  );
}

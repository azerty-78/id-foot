import type { ReactNode } from "react";
import Link from "next/link";

/* ── Boutons — charte ID FOOT ── */
const primaryClasses =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] bg-green px-4 py-2.5 text-sm font-semibold text-navy shadow-[var(--shadow-green)] transition hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-60";

const secondaryClasses =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-green/40 hover:bg-green-bg disabled:opacity-60";

const ghostClasses =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-green transition hover:bg-green-bg";

export function PrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${primaryClasses} ${className}`}>
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${secondaryClasses} ${className}`}>
      {children}
    </Link>
  );
}

export function GhostLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${ghostClasses} ${className}`}>
      {children}
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-section-label">ID FOOT</p>
        <h1 className="text-h1 mt-2">{title}</h1>
        {description && (
          <p className="text-body mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`admin-card rounded-[var(--radius-xl)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${primaryClasses} ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${secondaryClasses} ${className}`}>
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${ghostClasses} ${className}`}>
      {children}
    </button>
  );
}

export function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
      <div className="admin-card w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)]">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-section-label">Formulaire</p>
              <h2 className="text-h2 mt-1">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-sm)] p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-h3 mb-2 block">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-secondary mt-1.5">{children}</p>;
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-gray-100 bg-gray-50 p-5">
      <div className="mb-5">
        <h2 className="text-h2">{title}</h2>
        {description && <p className="text-body mt-1">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function FormInput({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? " *" : ""}
        {!required && (
          <span className="text-secondary ml-1 font-normal">(facultatif)</span>
        )}
      </FieldLabel>
      {children}
      <FieldError message={error} />
      {hint && !error && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <AdminCard className="px-6 py-16 text-center">
      <p className="text-body">{message}</p>
    </AdminCard>
  );
}

export function LoadingState({ message = "Chargement..." }: { message?: string }) {
  return (
    <AdminCard className="flex items-center justify-center px-6 py-16">
      <div className="text-body flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
        {message}
      </div>
    </AdminCard>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "error" | "neutral" | "gold";
  children: ReactNode;
}) {
  const styles = {
    success: "bg-green text-navy",
    error: "bg-danger text-white",
    neutral: "bg-gray-100 text-gray-600",
    gold: "bg-green text-navy",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

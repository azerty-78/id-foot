import type { ReactNode } from "react";

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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/70">
          Football ID
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
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
    <div className={`admin-card rounded-2xl ${className}`} {...props}>
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
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 ${className}`}
    />
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
      className={`inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 ${className}`}
    />
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand-light ${className}`}
    />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="admin-card w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand/70">
                Formulaire
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
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
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-rose-600">{message}</p>;
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-slate-400">{children}</p>;
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
    <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
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
          <span className="ml-1 text-xs font-normal text-slate-400">
            (facultatif)
          </span>
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
      <p className="text-sm text-slate-500">{message}</p>
    </AdminCard>
  );
}

export function LoadingState({ message = "Chargement..." }: { message?: string }) {
  return (
    <AdminCard className="flex items-center justify-center px-6 py-16">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
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
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    neutral: "bg-slate-100 text-slate-700",
    gold: "bg-gold text-brand-dark",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

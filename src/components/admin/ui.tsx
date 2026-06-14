import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";

export type ButtonSize = "default" | "sm" | "icon";

const btnBase = "btn disabled:cursor-not-allowed disabled:opacity-60";

function iconSize(size: ButtonSize): number {
  if (size === "sm") return 14;
  if (size === "icon") return 18;
  return 16;
}

function buildBtnClass(
  variant: string,
  size: ButtonSize = "default",
  className = "",
): string {
  const sizeClass =
    size === "sm" ? "btn-sm" : size === "icon" ? "btn-icon" : "";
  return [btnBase, variant, sizeClass, className].filter(Boolean).join(" ");
}

function ButtonIcon({
  icon: Icon,
  size = "default",
}: {
  icon?: LucideIcon;
  size?: ButtonSize;
}) {
  if (!Icon) return null;
  return <Icon size={iconSize(size)} strokeWidth={2} className="shrink-0" aria-hidden />;
}

type ActionButtonProps = {
  icon?: LucideIcon;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
};

type ActionLinkProps = ActionButtonProps & {
  href: string;
};

function PrimaryLink({
  href,
  icon,
  size = "default",
  children,
  className = "",
}: ActionLinkProps) {
  return (
    <Link href={href} className={buildBtnClass("btn-primary", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </Link>
  );
}

function SecondaryLink({
  href,
  icon,
  size = "default",
  children,
  className = "",
}: ActionLinkProps) {
  return (
    <Link href={href} className={buildBtnClass("btn-secondary", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </Link>
  );
}

function GhostLink({
  href,
  icon,
  size = "default",
  children,
  className = "",
}: ActionLinkProps) {
  return (
    <Link href={href} className={buildBtnClass("btn-ghost", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </Link>
  );
}

function OutlineLink({
  href,
  icon,
  size = "default",
  children,
  className = "",
}: ActionLinkProps) {
  return (
    <Link href={href} className={buildBtnClass("btn-outline", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </Link>
  );
}

function PrimaryButton({
  icon,
  size = "default",
  children,
  className = "",
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buildBtnClass("btn-primary", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </button>
  );
}

function SecondaryButton({
  icon,
  size = "default",
  children,
  className = "",
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buildBtnClass("btn-secondary", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </button>
  );
}

function DangerButton({
  icon,
  size = "default",
  children,
  className = "",
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buildBtnClass("btn-danger", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </button>
  );
}

function GhostButton({
  icon,
  size = "default",
  children,
  className = "",
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buildBtnClass("btn-ghost", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </button>
  );
}

function OutlineButton({
  icon,
  size = "default",
  children,
  className = "",
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buildBtnClass("btn-outline", size, className)}>
      <ButtonIcon icon={icon} size={size} />
      {size !== "icon" ? children : null}
    </button>
  );
}

export {
  DangerButton,
  GhostButton,
  GhostLink,
  OutlineButton,
  OutlineLink,
  PrimaryButton,
  PrimaryLink,
  SecondaryButton,
  SecondaryLink,
};

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

export type BadgeTone =
  | "success"
  | "navy"
  | "gray"
  | "danger"
  | "warning"
  | "error"
  | "gold"
  | "neutral";

export function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: ReactNode;
}) {
  const styles: Record<BadgeTone, string> = {
    success: "badge-success",
    navy: "badge-navy",
    gray: "badge-gray",
    danger: "badge-danger",
    warning: "badge-warning",
    error: "badge-danger",
    gold: "badge-navy",
    neutral: "badge-gray",
  };

  return <span className={`badge ${styles[tone]}`}>{children}</span>;
}

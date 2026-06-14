import type { LucideIcon } from "lucide-react";
import Image from "next/image";
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
  ...props
}: ActionLinkProps & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={buildBtnClass("btn-primary", size, className)}
      {...props}
    >
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
  ...props
}: ActionLinkProps & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={buildBtnClass("btn-ghost", size, className)}
      {...props}
    >
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

export function PageToolbar({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  action,
  userInitials = "IF",
}: {
  title: string;
  subtitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  action?: ReactNode;
  userInitials?: string;
}) {
  return (
    <div className="page-toolbar">
      <div className="min-w-0">
        <p className="page-toolbar-title">{title}</p>
        {subtitle && <p className="page-toolbar-subtitle">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange !== undefined && (
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input page-toolbar-search"
          />
        )}
        {action}
        <span className="user-avatar" aria-hidden>
          {userInitials}
        </span>
      </div>
    </div>
  );
}

export type CardVariant = "default" | "navy" | "accent";

const cardVariantClass: Record<CardVariant, string> = {
  default: "card-default",
  navy: "card-navy",
  accent: "card-accent",
};

export function Card({
  variant = "default",
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${cardVariantClass[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AdminCard({
  children,
  variant = "default",
  className = "",
  padded = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`${cardVariantClass[variant]} ${padded ? "" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  className = "",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  className?: string;
}) {
  return (
    <div className={`stat-card ${className}`}>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
      {delta && <p className="stat-card-delta">{delta}</p>}
    </div>
  );
}

export function AdminTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="admin-table">{children}</table>
    </div>
  );
}

export function InputWithIcon({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="input-icon-wrap">
      <Icon className="input-icon" size={16} strokeWidth={2} aria-hidden />
      {children}
    </div>
  );
}

export function UserAvatar({ initials }: { initials: string }) {
  return (
    <span className="user-avatar" aria-hidden>
      {initials}
    </span>
  );
}

export function PlayerAvatar({
  photo,
  prenom,
  nom,
  className = "",
}: {
  photo?: string | null;
  prenom: string;
  nom: string;
  className?: string;
}) {
  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  if (photo) {
    return (
      <Image
        src={photo}
        alt={`${prenom} ${nom}`}
        width={32}
        height={32}
        className={`player-avatar-photo ${className}`}
      />
    );
  }

  return <span className={`player-avatar ${className}`}>{initials}</span>;
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
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">{footer}</div>
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
    <label htmlFor={htmlFor} className="field-label">
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
    <section className="card-default space-y-5">
      <div>
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

"use client";

import type { ReactNode } from "react";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";

export function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  historyKey = "admin-modal",
  busy = false,
  panelClassName = "",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  historyKey?: string;
  busy?: boolean;
  panelClassName?: string;
}) {
  useHistoryOverlay(open && !busy, onClose, historyKey);

  if (!open) return null;

  function handleClose() {
    if (busy) return;
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div
        className={`modal-panel ${panelClassName} ${busy ? "modal-panel--busy" : ""}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-busy={busy || undefined}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="modal-close"
            aria-label="Fermer"
            disabled={busy}
          >
            ✕
          </button>
        </div>
        <div className="modal-body modal-body--relative">{children}</div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  );
}

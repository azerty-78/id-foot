"use client";

import { useEffect, useRef } from "react";

/**
 * Associe un overlay au geste / bouton Retour du navigateur.
 * Fermeture UI → history.back() si l'entrée overlay est active.
 */
export function useHistoryOverlay(
  isOpen: boolean,
  onClose: () => void,
  overlayId: string,
) {
  const onCloseRef = useRef(onClose);
  const isOpenRef = useRef(isOpen);
  const skipBackOnCloseRef = useRef(false);

  onCloseRef.current = onClose;
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ idFootOverlay: overlayId }, "");

    function handlePopState() {
      if (!isOpenRef.current) return;
      skipBackOnCloseRef.current = true;
      onCloseRef.current();
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, overlayId]);

  useEffect(() => {
    if (isOpen) return;

    if (skipBackOnCloseRef.current) {
      skipBackOnCloseRef.current = false;
      return;
    }

    const state = window.history.state as { idFootOverlay?: string } | null;
    if (state?.idFootOverlay === overlayId) {
      skipBackOnCloseRef.current = true;
      window.history.back();
    }
  }, [isOpen, overlayId]);
}

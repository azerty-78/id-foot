"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecentScan } from "./types";
import {
  loadScannerSession,
  markScannerCameraGranted,
  saveScannerSession,
  wasScannerCameraGranted,
} from "./scannerSession";

export function useScannerSession() {
  const [validatedCount, setValidatedCount] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [ready, setReady] = useState(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    const snapshot = loadScannerSession();
    setValidatedCount(snapshot.validatedCount);
    setRecentScans(snapshot.recentScans);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    saveScannerSession({ validatedCount, recentScans });
  }, [validatedCount, recentScans, ready]);

  const registerValidation = useCallback((player: RecentScan) => {
    setValidatedCount((count) => count + 1);
    setRecentScans((items) => [player, ...items].slice(0, 12));
    markScannerCameraGranted();
  }, []);

  return {
    ready,
    validatedCount,
    recentScans,
    registerValidation,
    wasCameraGrantedBefore: wasScannerCameraGranted,
  };
}

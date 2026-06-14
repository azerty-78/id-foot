"use client";

import Image from "next/image";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCard,
  DangerButton,
  FieldLabel,
  GhostLink,
  PageHeader,
  PrimaryButton,
  PrimaryLink,
  SecondaryButton,
} from "@/components/admin/ui";

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";
type ScanMode = "camera" | "manual";

type QrPlayer = {
  id: string;
  nom: string;
  prenom: string;
  numero: number;
  poste: string;
  photo: string | null;
  equipe: {
    nom: string;
    competition: {
      nom: string;
      annee: number;
    };
  };
  valid: true;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function extractToken(value: string): string | null {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/api\/qr\/([^/]+)/i);
    if (match?.[1]) return match[1];
  } catch {
    if (UUID_REGEX.test(trimmed)) return trimmed;
  }

  return null;
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export default function ScannerPage() {
  const [mode, setMode] = useState<ScanMode>("camera");
  const [state, setState] = useState<ScanState>("idle");
  const [manualToken, setManualToken] = useState("");
  const [player, setPlayer] = useState<QrPlayer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch {
      // ignore cleanup errors
    } finally {
      scannerRef.current = null;
    }
  }, []);

  const lookupToken = useCallback(
    async (rawValue: string) => {
      const token = extractToken(rawValue);

      if (!token) {
        setState("error");
        setPlayer(null);
        setErrorMessage("QR Code invalide ou format non reconnu.");
        return;
      }

      await stopScanner();
      setState("loading");
      setErrorMessage(null);
      setPlayer(null);

      try {
        const res = await fetch(`/api/qr/${token}`);
        const data = (await res.json()) as QrPlayer & {
          error?: string;
          valid?: boolean;
        };

        if (!res.ok || !data.valid) {
          throw new Error(data.error ?? "Joueur introuvable.");
        }

        setPlayer(data);
        setState("success");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "QR Code invalide."
        );
      }
    },
    [stopScanner]
  );

  const startScanner = useCallback(async () => {
    if (scannerRef.current || state === "loading" || state === "success") {
      return;
    }

    setState("scanning");
    setErrorMessage(null);
    setPlayer(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decodedText) => {
          void lookupToken(decodedText);
        },
        () => undefined
      );
    } catch {
      setState("error");
      setErrorMessage(
        "Impossible d'accéder à la caméra. Vérifiez les permissions."
      );
      await stopScanner();
    }
  }, [lookupToken, state, stopScanner]);

  const resetScan = useCallback(async () => {
    await stopScanner();
    setPlayer(null);
    setErrorMessage(null);
    setManualToken("");
    setState("idle");
  }, [stopScanner]);

  useEffect(() => {
    if (mode === "camera" && state === "idle") {
      void startScanner();
    }

    if (mode === "manual") {
      void stopScanner();
      if (state === "scanning") setState("idle");
    }
  }, [mode, state, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  async function handleManualSearch() {
    await lookupToken(manualToken);
  }

  return (
    <div>
      <PageHeader
        title="Scanner QR"
        description="Identifiez un joueur via caméra ou saisie manuelle du token."
      />

      <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => {
            void resetScan().then(() => setMode("camera"));
          }}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            mode === "camera"
              ? "bg-brand text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Scan caméra
        </button>
        <button
          type="button"
          onClick={() => {
            void resetScan().then(() => setMode("manual"));
          }}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            mode === "manual"
              ? "bg-brand text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Saisie manuelle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <AdminCard className="p-6">
          {mode === "camera" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Scan caméra</h2>
                {state === "scanning" && (
                  <span className="flex items-center gap-2 text-sm font-medium text-brand">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                    Scan en cours
                  </span>
                )}
              </div>

              <div className="mx-auto flex max-w-md items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand/20 bg-brand-light/40 p-4">
                <div id="qr-reader" className="w-full" />
              </div>

              {state === "idle" && (
                <PrimaryButton
                  type="button"
                  onClick={() => void startScanner()}
                  className="mt-4"
                >
                  Démarrer le scan
                </PrimaryButton>
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Saisie manuelle
              </h2>
              <FieldLabel htmlFor="manualToken">Token UUID</FieldLabel>
              <input
                id="manualToken"
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="admin-input"
              />
              <PrimaryButton
                type="button"
                onClick={() => void handleManualSearch()}
                disabled={!manualToken.trim() || state === "loading"}
                className="mt-4"
              >
                Rechercher
              </PrimaryButton>
            </div>
          )}

          {state === "loading" && (
            <p className="mt-4 text-sm font-medium text-slate-500">
              Identification en cours...
            </p>
          )}
        </AdminCard>

        <AdminCard className="p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Résultat</h2>

          {state === "success" && player && (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
              <StatusBadge tone="success">Joueur identifié</StatusBadge>

              <div className="mt-5 flex items-start gap-4">
                {player.photo ? (
                  <Image
                    src={player.photo}
                    alt={`${player.prenom} ${player.nom}`}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-2xl object-cover ring-2 ring-emerald-200"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
                    {getInitials(player.prenom, player.nom)}
                  </div>
                )}

                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {player.prenom} {player.nom}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    #{player.numero} · {player.poste}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{player.equipe.nom}</p>
                  <p className="text-sm text-slate-500">
                    {player.equipe.competition.nom} ({player.equipe.competition.annee})
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryLink href={`/admin/players/${player.id}`}>
                  Voir la fiche complète
                </PrimaryLink>
                <SecondaryButton type="button" onClick={() => void resetScan()}>
                  Nouveau scan
                </SecondaryButton>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
              <StatusBadge tone="error">QR Code invalide</StatusBadge>
              <p className="mt-4 text-sm text-rose-700">
                {errorMessage ?? "Aucun joueur correspondant à ce QR code."}
              </p>
              <DangerButton
                type="button"
                onClick={() => void resetScan()}
                className="mt-6"
              >
                Nouveau scan
              </DangerButton>
            </div>
          )}

          {(state === "idle" || state === "scanning" || state === "loading") &&
            !player && (
              <p className="text-sm leading-6 text-slate-500">
                {mode === "camera"
                  ? "Placez un QR code devant la caméra pour identifier un joueur."
                  : "Saisissez un token UUID puis cliquez sur Rechercher."}
              </p>
            )}
        </AdminCard>
      </div>
    </div>
  );
}

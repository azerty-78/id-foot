"use client";

import Image from "next/image";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Scanner QR</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Identifiez un joueur via QR code ou token manuel
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            void resetScan().then(() => setMode("camera"));
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "camera"
              ? "bg-[#1a472a] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Scan caméra
        </button>
        <button
          type="button"
          onClick={() => {
            void resetScan().then(() => setMode("manual"));
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "manual"
              ? "bg-[#1a472a] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Saisie manuelle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          {mode === "camera" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Scan caméra
                </h2>
                {state === "scanning" && (
                  <span className="text-sm font-medium text-[#1a472a]">
                    Scan en cours...
                  </span>
                )}
              </div>

              <div className="mx-auto flex max-w-md items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#1a472a]/30 bg-zinc-50 p-4">
                <div id="qr-reader" className="w-full" />
              </div>

              {state === "idle" && (
                <button
                  type="button"
                  onClick={() => void startScanner()}
                  className="mt-4 rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153d24]"
                >
                  Démarrer le scan
                </button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                Saisie manuelle
              </h2>
              <label
                htmlFor="manualToken"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Token UUID
              </label>
              <input
                id="manualToken"
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#1a472a] focus:ring-2 focus:ring-[#1a472a]/20"
              />
              <button
                type="button"
                onClick={() => void handleManualSearch()}
                disabled={!manualToken.trim() || state === "loading"}
                className="mt-4 rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#153d24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Rechercher
              </button>
            </div>
          )}

          {state === "loading" && (
            <p className="mt-4 text-sm font-medium text-zinc-500">
              Identification en cours...
            </p>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Résultat</h2>

          {state === "success" && player && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                ✓ Joueur identifié
              </span>

              <div className="mt-5 flex items-start gap-4">
                {player.photo ? (
                  <Image
                    src={player.photo}
                    alt={`${player.prenom} ${player.nom}`}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1a472a] text-lg font-bold text-white">
                    {getInitials(player.prenom, player.nom)}
                  </div>
                )}

                <div>
                  <p className="text-xl font-bold text-zinc-900">
                    {player.prenom} {player.nom}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    #{player.numero} · {player.poste}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">{player.equipe.nom}</p>
                  <p className="text-sm text-zinc-500">
                    {player.equipe.competition.nom} ({player.equipe.competition.annee})
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/admin/players/${player.id}`}
                  className="rounded-lg bg-[#1a472a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#153d24]"
                >
                  Voir la fiche complète
                </Link>
                <button
                  type="button"
                  onClick={() => void resetScan()}
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Nouveau scan
                </button>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                ✗ QR Code invalide
              </span>
              <p className="mt-4 text-sm text-rose-700">
                {errorMessage ?? "Aucun joueur correspondant à ce QR code."}
              </p>
              <button
                type="button"
                onClick={() => void resetScan()}
                className="mt-6 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                Nouveau scan
              </button>
            </div>
          )}

          {(state === "idle" || state === "scanning" || state === "loading") &&
            !player &&
            state !== "error" && (
              <p className="text-sm text-zinc-500">
                {mode === "camera"
                  ? "Placez un QR code devant la caméra pour identifier un joueur."
                  : "Saisissez un token UUID puis cliquez sur Rechercher."}
              </p>
            )}
        </section>
      </div>
    </div>
  );
}

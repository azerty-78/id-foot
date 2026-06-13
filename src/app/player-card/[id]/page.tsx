import Image from "next/image";
import { notFound } from "next/navigation";
import { PlayerCardQr } from "./PlayerCardQr";
import { PrintButton } from "./PrintButton";

type PlayerCardPageProps = {
  params: Promise<{ id: string }>;
};

type PlayerData = {
  id: string;
  nom: string;
  prenom: string;
  numero: number;
  poste: string;
  photo: string | null;
  qrToken: string;
  equipe: {
    nom: string;
    competition: {
      nom: string;
    };
  };
};

async function fetchPlayer(id: string): Promise<PlayerData | null> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/players/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Impossible de charger le joueur.");

  return res.json() as Promise<PlayerData>;
}

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export default async function PlayerCardPage({ params }: PlayerCardPageProps) {
  const { id } = await params;
  const player = await fetchPlayer(id);

  if (!player) {
    notFound();
  }

  const shortId = player.id.slice(0, 8).toUpperCase();

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 85.6mm 53.98mm;
            margin: 0;
          }

          body {
            margin: 0;
          }

          body * {
            visibility: hidden;
          }

          #player-card,
          #player-card * {
            visibility: visible;
          }

          #player-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 85.6mm;
            height: 53.98mm;
            margin: 0;
            box-shadow: none;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-8">
        <PrintButton />

        <article
          id="player-card"
          className="flex w-[85.6mm] flex-col overflow-hidden rounded-xl bg-[#1a472a] text-white shadow-lg"
          style={{ minHeight: "53.98mm" }}
        >
          <header className="border-b border-white/10 px-3 py-1.5 text-center">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide">
              {player.equipe.competition.nom}
            </p>
          </header>

          <div className="flex flex-1 gap-3 px-3 py-2">
            <div className="shrink-0">
              {player.photo ? (
                <Image
                  src={player.photo}
                  alt={`${player.prenom} ${player.nom}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/10 text-xl font-bold">
                  {getInitials(player.prenom, player.nom)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                {player.nom} {player.prenom}
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-[#FFD700]">
                #{player.numero}
                <span className="ml-2 text-xs font-medium text-[#FFD700]/90">
                  {player.poste}
                </span>
              </p>
              <p className="mt-2 truncate text-[10px] text-white/80">
                {player.equipe.nom}
              </p>
            </div>
          </div>

          <footer className="flex items-end justify-between border-t border-white/10 px-3 py-2">
            <p className="text-[9px] text-zinc-300">ID: {shortId}</p>
            <div className="rounded bg-white p-1">
              <PlayerCardQr token={player.qrToken} size={70} />
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

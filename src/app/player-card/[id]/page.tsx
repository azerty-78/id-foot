import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlayerCardQr } from "./PlayerCardQr";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

type PlayerCardPageProps = {
  params: Promise<{ id: string }>;
};

async function fetchPlayer(id: string) {
  return prisma.joueur.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      numero: true,
      poste: true,
      photo: true,
      qrToken: true,
      equipe: {
        select: {
          nom: true,
          competition: { select: { nom: true } },
        },
      },
    },
  });
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

      <div className="admin-shell flex min-h-screen flex-col items-center justify-center p-8">
        <PrintButton />

        <article
          id="player-card"
          className="pitch-pattern flex w-[85.6mm] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-green to-navy text-white shadow-[var(--shadow-green)] ring-1 ring-white/10"
          style={{ minHeight: "53.98mm" }}
        >
          <header className="border-b border-white/10 bg-black/10 px-3 py-2 text-center">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-green">
              {player.equipe.competition.nom}
            </p>
          </header>

          <div className="flex flex-1 gap-3 px-3 py-2.5">
            <div className="shrink-0">
              {player.photo ? (
                <Image
                  src={player.photo}
                  alt={`${player.prenom} ${player.nom}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/10 text-xl font-bold ring-2 ring-white/20">
                  {getInitials(player.prenom, player.nom)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                {player.nom} {player.prenom}
              </p>
              <p className="mt-1 text-lg font-black leading-none text-green">
                #{player.numero ?? "—"}
                {player.poste ? (
                  <span className="ml-2 text-xs font-semibold text-green/90">
                    {player.poste}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 truncate text-[10px] text-white/75">
                {player.equipe.nom}
              </p>
            </div>
          </div>

          <footer className="flex items-end justify-between border-t border-white/10 bg-black/10 px-3 py-2">
            <p className="text-[9px] font-medium text-white/50">ID: {shortId}</p>
            <div className="rounded-lg bg-white p-1 shadow-sm">
              <PlayerCardQr token={player.qrToken} size={70} />
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

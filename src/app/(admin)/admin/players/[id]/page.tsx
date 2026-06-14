import { PlayerDetailView } from "./PlayerDetailView";

type PlayerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params;
  return <PlayerDetailView id={id} />;
}

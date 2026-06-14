import { EditPlayerView } from "./EditPlayerView";

type EditPlayerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const { id } = await params;
  return <EditPlayerView id={id} />;
}

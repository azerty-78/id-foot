import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { LoadingState } from "@/components/admin/ui";
import { authOptions } from "@/lib/auth";
import { resolveSafeCallbackUrl } from "@/lib/auth/callbackUrl";
import { ADMIN_COMPETITION_HOME } from "@/lib/competitionSlug";
import { buildCompetitionSignInMetadata } from "@/lib/competitionSignInShare";
import { getAppBaseUrl } from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";
import SignInForm, { type SignInCompetitionPreview } from "./SignInForm";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{ competition?: string; callbackUrl?: string }>;
};

const competitionSelect = {
  nom: true,
  abbreviation: true,
  annee: true,
  lieu: true,
  image: true,
} as const;

async function loadCompetitionPreview(
  slug: string | undefined,
): Promise<SignInCompetitionPreview | null> {
  if (!slug) return null;

  return prisma.competition.findUnique({
    where: { slug },
    select: competitionSelect,
  });
}

export async function generateMetadata({
  searchParams,
}: SignInPageProps): Promise<Metadata> {
  const { competition: slug } = await searchParams;
  const competition = await loadCompetitionPreview(slug);

  if (!competition) {
    return buildCompetitionSignInMetadata(null, getAppBaseUrl());
  }

  return buildCompetitionSignInMetadata(
    { ...competition, slug: slug! },
    getAppBaseUrl(),
  );
}

async function SignInPageContent({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const competitionSlug = params.competition ?? "";
  const callbackUrl = resolveSafeCallbackUrl(
    params.callbackUrl,
    ADMIN_COMPETITION_HOME,
  );
  const session = await getServerSession(authOptions);

  if (session?.user?.active !== false && session?.user?.id) {
    redirect(callbackUrl);
  }

  const competition = await loadCompetitionPreview(competitionSlug || undefined);

  return (
    <SignInForm
      competitionSlug={competitionSlug}
      competition={competition}
      callbackUrl={params.callbackUrl}
    />
  );
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  return (
    <Suspense fallback={<LoadingState message="Chargement..." />}>
      <SignInPageContent searchParams={searchParams} />
    </Suspense>
  );
}

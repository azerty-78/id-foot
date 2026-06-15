import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/admin/ui";
import { buildCompetitionSignInMetadata } from "@/lib/competitionSignInShare";
import { getAppBaseUrl } from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";
import SignInForm from "./SignInForm";

type SignInPageProps = {
  searchParams: Promise<{ competition?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SignInPageProps): Promise<Metadata> {
  const { competition: slug } = await searchParams;

  if (!slug) {
    return buildCompetitionSignInMetadata(null, getAppBaseUrl());
  }

  const competition = await prisma.competition.findUnique({
    where: { slug },
    select: {
      nom: true,
      slug: true,
      annee: true,
      lieu: true,
      image: true,
    },
  });

  if (!competition) {
    return buildCompetitionSignInMetadata(null, getAppBaseUrl());
  }

  return buildCompetitionSignInMetadata(competition, getAppBaseUrl());
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingState message="Chargement..." />}>
      <SignInForm />
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import { ProfilView } from "@/components/admin/profile/ProfilView";
import { getAuthUser } from "@/lib/auth/server";
import {
  canManageCompetitionUsers,
  userPublicSelect,
} from "@/lib/auth/users";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/admin/signin");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: userPublicSelect,
  });

  if (!profile) {
    redirect("/admin/signin");
  }

  const initialUsers =
    canManageCompetitionUsers(user) && user.competitionId
      ? await prisma.user.findMany({
          where: { competitionId: user.competitionId },
          select: userPublicSelect,
          orderBy: [{ role: "asc" }, { nom: "asc" }],
        })
      : [];

  return (
    <ProfilView
      user={user}
      profile={profile}
      initialUsers={initialUsers}
    />
  );
}

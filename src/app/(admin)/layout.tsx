import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAuthUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/admin/signin");
  }

  const competition =
    user.competitionId && user.role !== "SUPER_ADMIN"
      ? await prisma.competition.findUnique({
          where: { id: user.competitionId },
          select: { id: true, nom: true, slug: true, image: true },
        })
      : null;

  return (
    <AdminShell user={user} competition={competition}>
      {children}
    </AdminShell>
  );
}

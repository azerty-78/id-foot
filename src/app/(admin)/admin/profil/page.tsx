import { redirect } from "next/navigation";
import { ProfilView } from "@/components/admin/profile/ProfilView";
import { getAuthUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/admin/signin");
  }

  return <ProfilView user={user} />;
}

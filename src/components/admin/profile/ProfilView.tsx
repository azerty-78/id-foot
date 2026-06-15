"use client";

import { ProfileAccountSection } from "@/components/admin/profile/ProfileAccountSection";
import { ProfilePasswordSection } from "@/components/admin/profile/ProfilePasswordSection";
import { UserManagementSection } from "@/components/admin/profile/UserManagementSection";
import { PageHeader } from "@/components/admin/ui";
import type { AuthUser } from "@/lib/auth/scope";
import type { PublicUser } from "@/lib/auth/users";
import { canManageCompetitionUsers } from "@/lib/auth/users";

export function ProfilView({
  user,
  profile,
  initialUsers,
}: {
  user: AuthUser;
  profile: PublicUser;
  initialUsers: PublicUser[];
}) {
  const showUserManagement = canManageCompetitionUsers(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Gérez vos informations de connexion et, si vous êtes administrateur, les comptes gestionnaires."
      />

      <div className="space-y-6">
        <ProfileAccountSection
          key={`${profile.id}-${profile.nom}`}
          initialUser={profile}
        />
        <ProfilePasswordSection />
        {showUserManagement && user.competitionId ? (
          <UserManagementSection
            currentUserId={user.id}
            competitionId={user.competitionId}
            initialUsers={initialUsers}
          />
        ) : null}
      </div>
    </div>
  );
}

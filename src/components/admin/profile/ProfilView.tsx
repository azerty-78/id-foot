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
  const scanOnlyAccount = user.scanOnly;

  return (
    <div className="space-y-6">
      <PageHeader
        title={scanOnlyAccount ? "Mon compte" : "Profil"}
        description={
          scanOnlyAccount
            ? "Changez votre mot de passe de connexion."
            : "Gérez vos informations de connexion et, si vous êtes administrateur, les comptes gestionnaires."
        }
      />

      <div className="space-y-6">
        {!scanOnlyAccount ? (
          <ProfileAccountSection
            key={`${profile.id}-${profile.nom}`}
            initialUser={profile}
          />
        ) : (
          <div className="card-default px-4 py-4 sm:px-6">
            <p className="text-sm font-medium text-navy">{profile.nom}</p>
            <p className="text-secondary mt-1 text-sm">{profile.email}</p>
            <p className="mt-3 text-xs text-secondary">
              Compte contrôleur · accès limité au scanner QR.
            </p>
          </div>
        )}
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

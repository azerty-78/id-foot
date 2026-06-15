"use client";

import { useEffect, useState } from "react";
import { ProfileAccountSection } from "@/components/admin/profile/ProfileAccountSection";
import { ProfilePasswordSection } from "@/components/admin/profile/ProfilePasswordSection";
import { UserManagementSection } from "@/components/admin/profile/UserManagementSection";
import { LoadingState, PageHeader } from "@/components/admin/ui";
import type { AuthUser } from "@/lib/auth/scope";
import type { PublicUser } from "@/lib/auth/users";
import { canManageCompetitionUsers } from "@/lib/auth/users";

export function ProfilView({ user }: { user: AuthUser }) {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users/me");
        const data = (await res.json()) as PublicUser & { error?: string };
        if (!res.ok) {
          if (!cancelled) {
            setError(data.error ?? "Impossible de charger le profil.");
            setProfile(null);
          }
          return;
        }
        if (!cancelled) {
          setProfile(data);
        }
      } catch {
        if (!cancelled) {
          setError("Erreur réseau. Réessayez.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const showUserManagement = canManageCompetitionUsers(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Gérez vos informations de connexion et, si vous êtes administrateur, les comptes gestionnaires."
      />

      {loading ? (
        <LoadingState message="Chargement du profil…" />
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : profile ? (
        <div className="space-y-6">
          <ProfileAccountSection
            initialUser={profile}
            onUserUpdated={setProfile}
          />
          <ProfilePasswordSection />
          {showUserManagement && user.competitionId ? (
            <UserManagementSection
              currentUserId={user.id}
              competitionId={user.competitionId}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import {
  KeyRound,
  LogOut,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminTable,
  DangerButton,
  EmptyState,
  FieldError,
  FieldLabel,
  GhostButton,
  OutlineButton,
  PageHeader,
  PageToolbar,
  PrimaryButton,
  StatCard,
  StatusBadge,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import type { GodModeAdminUser } from "@/lib/god-mode/auth";

type AdminStats = {
  total: number;
  active: number;
  inactive: number;
};

type EditForm = {
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ModalMode = "edit" | "password" | null;

type GodModePanelProps = {
  sessionUser: {
    id: string;
    email: string;
    name: string;
  };
  initialAdmins: GodModeAdminUser[];
  initialStats: AdminStats;
};

export function GodModePanel({
  sessionUser,
  initialAdmins,
  initialStats,
}: GodModePanelProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState(initialAdmins);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<GodModeAdminUser | null>(null);
  const [form, setForm] = useState<EditForm>({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyAdminId, setBusyAdminId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return admins;

    return admins.filter((admin) => {
      const competitionLabel = admin.competition
        ? `${admin.competition.nom} ${admin.competition.slug}`
        : "";
      return (
        admin.nom.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        competitionLabel.toLowerCase().includes(query)
      );
    });
  }, [admins, search]);

  function recomputeStats(items: GodModeAdminUser[]): AdminStats {
    return {
      total: items.length,
      active: items.filter((admin) => admin.active).length,
      inactive: items.filter((admin) => !admin.active).length,
    };
  }

  async function refreshAdmins() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/god-mode/admins");
      const data = (await res.json()) as {
        admins?: GodModeAdminUser[];
        stats?: AdminStats;
        error?: string;
      };

      if (!res.ok || !data.admins || !data.stats) {
        showToast("error", data.error ?? "Impossible de recharger les administrateurs.");
        return;
      }

      setAdmins(data.admins);
      setStats(data.stats);
    } catch {
      showToast("error", "Erreur réseau lors du rechargement.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/god-mode/auth/logout", { method: "POST" });
    router.refresh();
  }

  function openEditModal(admin: GodModeAdminUser) {
    setSelectedAdmin(admin);
    setForm({
      nom: admin.nom,
      email: admin.email,
      password: "",
      confirmPassword: "",
    });
    setFormError(null);
    setModalMode("edit");
  }

  function openPasswordModal(admin: GodModeAdminUser) {
    setSelectedAdmin(admin);
    setForm({
      nom: admin.nom,
      email: admin.email,
      password: "",
      confirmPassword: "",
    });
    setFormError(null);
    setModalMode("password");
  }

  function closeModal() {
    if (submitting) return;
    setModalMode(null);
    setSelectedAdmin(null);
    setFormError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdmin) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/god-mode/admins/${selectedAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: form.nom, email: form.email }),
      });
      const data = (await res.json()) as GodModeAdminUser & { error?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Impossible de mettre à jour l'administrateur.");
        return;
      }

      const nextAdmins = admins.map((admin) =>
        admin.id === data.id ? data : admin,
      );
      setAdmins(nextAdmins);
      setStats(recomputeStats(nextAdmins));
      closeModal();
      showToast("success", "Administrateur mis à jour.");
    } catch {
      setFormError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdmin) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/god-mode/admins/${selectedAdmin.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Impossible de changer le mot de passe.");
        return;
      }

      closeModal();
      showToast("success", "Mot de passe administrateur mis à jour.");
    } catch {
      setFormError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(admin: GodModeAdminUser) {
    setBusyAdminId(admin.id);
    try {
      const res = await fetch(`/api/god-mode/admins/${admin.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !admin.active }),
      });
      const data = (await res.json()) as GodModeAdminUser & { error?: string };

      if (!res.ok) {
        showToast("error", data.error ?? "Impossible de modifier le statut.");
        return;
      }

      const nextAdmins = admins.map((item) => (item.id === data.id ? data : item));
      setAdmins(nextAdmins);
      setStats(recomputeStats(nextAdmins));
      showToast(
        "success",
        data.active ? "Administrateur activé." : "Administrateur désactivé.",
      );
    } catch {
      showToast("error", "Erreur réseau. Réessayez.");
    } finally {
      setBusyAdminId(null);
    }
  }

  async function deleteAdmin(admin: GodModeAdminUser) {
    const competitionLabel = admin.competition?.nom ?? "sans compétition";
    const confirmed = window.confirm(
      `Supprimer l'administrateur ${admin.nom} (${competitionLabel}) ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    setBusyAdminId(admin.id);
    try {
      const res = await fetch(`/api/god-mode/admins/${admin.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        showToast("error", data.error ?? "Impossible de supprimer l'administrateur.");
        return;
      }

      const nextAdmins = admins.filter((item) => item.id !== admin.id);
      setAdmins(nextAdmins);
      setStats(recomputeStats(nextAdmins));
      showToast("success", "Administrateur supprimé.");
    } catch {
      showToast("error", "Erreur réseau. Réessayez.");
    } finally {
      setBusyAdminId(null);
    }
  }

  return (
    <div className="god-mode-panel mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="God Mode"
        description={`Connecté en tant que ${sessionUser.name} · gestion globale des administrateurs de compétition.`}
        action={
          <div className="flex flex-wrap gap-2">
            <OutlineButton
              type="button"
              icon={RefreshCw}
              onClick={() => void refreshAdmins()}
              loading={refreshing}
            >
              Actualiser
            </OutlineButton>
            <GhostButton type="button" icon={LogOut} onClick={() => void handleLogout()}>
              Quitter god-mode
            </GhostButton>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Administrateurs" value={stats.total} icon={Users} />
        <StatCard label="Actifs" value={stats.active} icon={UserCheck} tone="default" />
        <StatCard
          label="Inactifs"
          value={stats.inactive}
          icon={UserX}
          tone={stats.inactive > 0 ? "warning" : "default"}
        />
      </div>

      <section className="card-default space-y-5">
        <PageToolbar
          title="Administrateurs de compétition"
          subtitle="Comptes ADMIN liés à une compétition"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par nom, email ou compétition…"
        />

        {filteredAdmins.length === 0 ? (
          <EmptyState
            message={
              search
                ? "Aucun administrateur ne correspond à cette recherche."
                : "Aucun administrateur enregistré pour le moment."
            }
          />
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Compétition</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => {
                const busy = busyAdminId === admin.id;

                return (
                  <tr key={admin.id}>
                    <td className="font-medium text-navy">{admin.nom}</td>
                    <td>{admin.email}</td>
                    <td>
                      {admin.competition ? (
                        <div className="min-w-0">
                          <p className="truncate font-medium">{admin.competition.nom}</p>
                          <p className="text-secondary truncate text-xs">
                            {admin.competition.slug} · {admin.competition.annee}
                          </p>
                        </div>
                      ) : (
                        <span className="text-secondary text-xs">Non assigné</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge tone={admin.active ? "success" : "danger"}>
                        {admin.active ? "Actif" : "Inactif"}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={Pencil}
                          onClick={() => openEditModal(admin)}
                          disabled={busy}
                        >
                          Modifier
                        </OutlineButton>
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={KeyRound}
                          onClick={() => openPasswordModal(admin)}
                          disabled={busy}
                        >
                          Mot de passe
                        </OutlineButton>
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={admin.active ? UserX : UserCheck}
                          onClick={() => void toggleActive(admin)}
                          disabled={busy}
                        >
                          {admin.active ? "Désactiver" : "Activer"}
                        </OutlineButton>
                        <DangerButton
                          type="button"
                          size="sm"
                          icon={Trash2}
                          onClick={() => void deleteAdmin(admin)}
                          disabled={busy}
                        >
                          Supprimer
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </AdminTable>
        )}
      </section>

      <section className="card-default flex items-start gap-3 border-l-[3px] border-green">
        <Shield size={18} className="mt-0.5 shrink-0 text-green" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-navy">Zone développeur</p>
          <p className="text-secondary mt-1 text-sm">
            Cette interface ne remplace pas l&apos;administration compétition. Elle permet
            uniquement de superviser les comptes ADMIN à l&apos;échelle de la plateforme.
          </p>
        </div>
      </section>

      <AdminModal
        open={modalMode !== null}
        title={
          modalMode === "edit"
            ? "Modifier l'administrateur"
            : "Réinitialiser le mot de passe"
        }
        onClose={closeModal}
        busy={submitting}
        footer={
          <>
            <GhostButton type="button" onClick={closeModal} disabled={submitting}>
              Annuler
            </GhostButton>
            <PrimaryButton
              type="submit"
              form="god-mode-admin-form"
              loading={submitting}
            >
              Enregistrer
            </PrimaryButton>
          </>
        }
      >
        <form
          id="god-mode-admin-form"
          onSubmit={(e) => {
            if (modalMode === "edit") void handleEdit(e);
            else if (modalMode === "password") void handlePasswordReset(e);
            else e.preventDefault();
          }}
          className="space-y-4"
        >
          {modalMode === "edit" && (
            <>
              <div>
                <FieldLabel htmlFor="god-admin-nom">Nom</FieldLabel>
                <input
                  id="god-admin-nom"
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="admin-input mt-1.5 w-full"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <FieldLabel htmlFor="god-admin-email">Email</FieldLabel>
                <input
                  id="god-admin-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="admin-input mt-1.5 w-full"
                  required
                />
              </div>
            </>
          )}

          {modalMode === "password" && selectedAdmin && (
            <p className="text-secondary text-sm">
              Nouveau mot de passe pour <strong>{selectedAdmin.nom}</strong>.
            </p>
          )}

          {modalMode === "password" && (
            <>
              <div>
                <FieldLabel htmlFor="god-admin-password">Nouveau mot de passe</FieldLabel>
                <input
                  id="god-admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="admin-input mt-1.5 w-full"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <FieldLabel htmlFor="god-admin-confirm-password">
                  Confirmer le mot de passe
                </FieldLabel>
                <input
                  id="god-admin-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="admin-input mt-1.5 w-full"
                  required
                  minLength={8}
                />
              </div>
            </>
          )}

          <FieldError message={formError ?? undefined} />
        </form>
      </AdminModal>
    </div>
  );
}

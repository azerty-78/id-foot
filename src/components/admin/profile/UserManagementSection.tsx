"use client";

import {
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserCheck,
  UserX,
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
  FormSection,
  GhostButton,
  OutlineButton,
  PageToolbar,
  PrimaryButton,
  StatusBadge,
} from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import type { PublicUser } from "@/lib/auth/users";
import { isManageableManager, roleLabel, scanOnlyLabel, sortCompetitionUsers } from "@/lib/auth/users";

type ManagerForm = {
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
  scanOnly: boolean;
};

const emptyCreateForm: ManagerForm = {
  nom: "",
  email: "",
  password: "",
  confirmPassword: "",
  scanOnly: false,
};

type ModalMode = "create" | "edit" | "password" | "delete" | null;

export function UserManagementSection({
  currentUserId,
  competitionId,
  initialUsers,
}: {
  currentUserId: string;
  competitionId: string;
  initialUsers: PublicUser[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState(() => sortCompetitionUsers(initialUsers));
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [form, setForm] = useState<ManagerForm>(emptyCreateForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.nom.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        roleLabel(user.role).toLowerCase().includes(query),
    );
  }, [search, users]);

  function openCreateModal() {
    setSelectedUser(null);
    setForm(emptyCreateForm);
    setFormError(null);
    setModalMode("create");
  }

  function openEditModal(user: PublicUser) {
    setSelectedUser(user);
    setForm({
      nom: user.nom,
      email: user.email,
      password: "",
      confirmPassword: "",
      scanOnly: user.scanOnly,
    });
    setFormError(null);
    setModalMode("edit");
  }

  function openPasswordModal(user: PublicUser) {
    setSelectedUser(user);
    setForm({
      nom: user.nom,
      email: user.email,
      password: "",
      confirmPassword: "",
      scanOnly: user.scanOnly,
    });
    setFormError(null);
    setModalMode("password");
  }

  function closeModal() {
    if (submitting) return;
    setModalMode(null);
    setSelectedUser(null);
    setFormError(null);
  }

  async function refreshUsers() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/users");
      const data = (await res.json()) as PublicUser[] & { error?: string };
      if (!res.ok) {
        showToast("error", data.error ?? "Impossible de recharger la liste.");
        return;
      }
      setUsers(sortCompetitionUsers(data));
      router.refresh();
      showToast("success", "Liste actualisée.");
    } catch {
      showToast("error", "Erreur réseau lors du rechargement.");
    } finally {
      setRefreshing(false);
    }
  }

  function validatePasswordFields(password: string, confirmPassword: string): string | null {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const passwordError = validatePasswordFields(form.password, form.confirmPassword);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          scanOnly: form.scanOnly,
        }),
      });
      const data = (await res.json()) as PublicUser & { error?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Impossible de créer le gestionnaire.");
        return;
      }

      setUsers((prev) => sortCompetitionUsers([...prev, data]));
      closeModal();
      showToast("success", "Gestionnaire créé.");
    } catch {
      setFormError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email,
          scanOnly: form.scanOnly,
        }),
      });
      const data = (await res.json()) as PublicUser & { error?: string };

      if (!res.ok) {
        setFormError(data.error ?? "Impossible de mettre à jour le gestionnaire.");
        return;
      }

      setUsers((prev) =>
        sortCompetitionUsers(prev.map((user) => (user.id === data.id ? data : user))),
      );
      closeModal();
      showToast("success", "Gestionnaire mis à jour.");
    } catch {
      setFormError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    setFormError(null);

    const passwordError = validatePasswordFields(form.password, form.confirmPassword);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/password`, {
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
      showToast("success", "Mot de passe du gestionnaire mis à jour.");
    } catch {
      setFormError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(user: PublicUser) {
    setBusyUserId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = (await res.json()) as PublicUser & { error?: string };

      if (!res.ok) {
        showToast("error", data.error ?? "Impossible de modifier le statut.");
        return;
      }

      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      showToast(
        "success",
        data.active ? "Gestionnaire activé." : "Gestionnaire désactivé.",
      );
    } catch {
      showToast("error", "Erreur réseau. Réessayez.");
    } finally {
      setBusyUserId(null);
    }
  }

  function openDeleteModal(user: PublicUser) {
    setSelectedUser(user);
    setFormError(null);
    setModalMode("delete");
  }

  async function confirmDeleteUser() {
    if (!selectedUser) return;

    setSubmitting(true);
    setBusyUserId(selectedUser.id);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        showToast("error", data.error ?? "Impossible de supprimer le gestionnaire.");
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== selectedUser.id));
      closeModal();
      showToast("success", "Gestionnaire supprimé.");
    } catch {
      showToast("error", "Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
      setBusyUserId(null);
    }
  }

  const modalTitle =
    modalMode === "create"
      ? "Créer un gestionnaire"
      : modalMode === "edit"
        ? "Modifier le gestionnaire"
        : modalMode === "password"
          ? "Changer le mot de passe"
          : modalMode === "delete"
            ? "Supprimer le gestionnaire"
            : "";

  return (
    <FormSection
      title="Gestion des utilisateurs"
      description="Créez et administrez les comptes gestionnaires de votre compétition."
    >
      <PageToolbar
        title="Utilisateurs"
        subtitle={`${users.length} compte${users.length > 1 ? "s" : ""}`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom ou email…"
        action={
          <div className="flex flex-wrap gap-2">
            <OutlineButton
              type="button"
              icon={RefreshCw}
              onClick={() => void refreshUsers()}
              loading={refreshing}
            >
              Actualiser
            </OutlineButton>
            <PrimaryButton type="button" icon={Plus} onClick={openCreateModal}>
              Nouveau gestionnaire
            </PrimaryButton>
          </div>
        }
      />

      {filteredUsers.length === 0 ? (
        <EmptyState
          message={
            search
              ? "Aucun résultat pour cette recherche."
              : "Aucun utilisateur. Ajoutez un gestionnaire pour déléguer la gestion de la compétition."
          }
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const manageable = isManageableManager(user, {
                id: currentUserId,
                name: "",
                email: "",
                role: "ADMIN",
                competitionId,
                scanOnly: false,
              });
              const isSelf = user.id === currentUserId;
              const busy = busyUserId === user.id;

              return (
                <tr key={user.id}>
                  <td className="font-medium text-navy">
                    {user.nom}
                    {isSelf ? (
                      <span className="text-secondary ml-1 text-xs">(vous)</span>
                    ) : null}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{roleLabel(user.role)}</span>
                      {user.scanOnly ? (
                        <StatusBadge tone="navy">{scanOnlyLabel(true)}</StatusBadge>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <StatusBadge tone={user.active ? "success" : "danger"}>
                      {user.active ? "Actif" : "Inactif"}
                    </StatusBadge>
                  </td>
                  <td>
                    {manageable ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={Pencil}
                          onClick={() => openEditModal(user)}
                          disabled={busy}
                        >
                          Modifier
                        </OutlineButton>
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={KeyRound}
                          onClick={() => openPasswordModal(user)}
                          disabled={busy}
                        >
                          Mot de passe
                        </OutlineButton>
                        <OutlineButton
                          type="button"
                          size="sm"
                          icon={user.active ? UserX : UserCheck}
                          onClick={() => void toggleActive(user)}
                          disabled={busy || isSelf}
                        >
                          {user.active ? "Désactiver" : "Activer"}
                        </OutlineButton>
                        <DangerButton
                          type="button"
                          size="sm"
                          icon={Trash2}
                          onClick={() => openDeleteModal(user)}
                          disabled={busy || isSelf}
                        >
                          Supprimer
                        </DangerButton>
                      </div>
                    ) : (
                      <span className="text-secondary text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}

      <AdminModal
        open={modalMode !== null}
        title={modalTitle}
        onClose={closeModal}
        busy={submitting}
        footer={
          modalMode === "delete" ? (
            <>
              <GhostButton type="button" onClick={closeModal} disabled={submitting}>
                Annuler
              </GhostButton>
              <DangerButton
                type="button"
                icon={Trash2}
                onClick={() => void confirmDeleteUser()}
                disabled={submitting}
              >
                Supprimer
              </DangerButton>
            </>
          ) : (
            <>
              <GhostButton type="button" onClick={closeModal} disabled={submitting}>
                Annuler
              </GhostButton>
              <PrimaryButton
                type="submit"
                form="manager-user-form"
                icon={Save}
                loading={submitting}
              >
                Enregistrer
              </PrimaryButton>
            </>
          )
        }
      >
        {modalMode === "delete" && selectedUser ? (
          <p className="text-body">
            Supprimer le gestionnaire <strong>{selectedUser.nom}</strong> (
            {selectedUser.email}) ? Cette action est irréversible.
          </p>
        ) : (
          <form
            id="manager-user-form"
            onSubmit={(e) => {
              if (modalMode === "create") void handleCreate(e);
              else if (modalMode === "edit") void handleEdit(e);
              else if (modalMode === "password") void handlePasswordReset(e);
              else e.preventDefault();
            }}
            className="space-y-4"
          >
          {modalMode !== "password" && (
            <>
              <div>
                <FieldLabel htmlFor="manager-nom">Nom</FieldLabel>
                <input
                  id="manager-nom"
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="admin-input mt-1.5 w-full"
                  required
                  minLength={2}
                />
              </div>
              <div>
                <FieldLabel htmlFor="manager-email">Email</FieldLabel>
                <input
                  id="manager-email"
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

          {(modalMode === "create" || modalMode === "edit") && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.scanOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, scanOnly: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
              />
              <span className="text-left">
                <span className="block text-sm font-medium text-navy">
                  Accès scan uniquement
                </span>
                <span className="mt-0.5 block text-xs text-secondary">
                  Le gestionnaire ne verra que le scanner QR et pourra changer son
                  mot de passe. Aucun accès aux joueurs, équipes ou fiches détaillées.
                </span>
              </span>
            </label>
          )}

          {(modalMode === "create" || modalMode === "password") && (
            <>
              <div>
                <FieldLabel htmlFor="manager-password">
                  {modalMode === "create" ? "Mot de passe" : "Nouveau mot de passe"}
                </FieldLabel>
                <input
                  id="manager-password"
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
                <FieldLabel htmlFor="manager-confirm-password">
                  Confirmer le mot de passe
                </FieldLabel>
                <input
                  id="manager-confirm-password"
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
        )}
      </AdminModal>
    </FormSection>
  );
}

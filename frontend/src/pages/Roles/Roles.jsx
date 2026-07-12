import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, PencilLine, Plus, Save, ShieldCheck, Trash2, XCircle } from "lucide-react";

import { getPermissions } from "../../api/permissions";
import { createRole, deleteRole, getRoles, updateRole, updateRolePermissions } from "../../api/roles";
import useAuth from "../../auth/useAuth";
import { canEditPermissions, canEditRole, canManagePermissions, canManageRoles as canManageRoleRecords, canViewRoles, getPrimaryRole } from "../../auth/permissions";

const permissionSections = [
  { title: "Users", keys: ["users.view", "users.create", "users.edit", "users.delete"] },
  { title: "Roles", keys: ["roles.view", "roles.manage"] },
  { title: "Permissions", keys: ["permissions.view"] },
  { title: "Audit", keys: ["audit.view"] },
];

const emptyDraft = { name: "", description: "", permissions: [] };

function Roles() {
  const { user: currentUser } = useAuth();
  const loggedInRole = getPrimaryRole(currentUser);
  const canManageRoles = canManageRoleRecords(currentUser);
  const canManagePermissionAssignments = canManagePermissions(currentUser);

  if (!canViewRoles(currentUser)) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-8 text-center shadow-xl text-slate-900">
        <h3 className="text-xl font-semibold">Roles unavailable</h3>
        <p className="mt-2 text-sm text-slate-500">You do not have permission to view roles.</p>
      </div>
    );
  }

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const rolesResponse = await getRoles({ page_size: 100 });
        const permissionsResponse = canManagePermissionAssignments
          ? await getPermissions({ page_size: 100 })
          : [];
        if (!mounted) {
          return;
        }
        const roleList = rolesResponse.results || rolesResponse || [];
        setRoles(roleList);
        setPermissions(permissionsResponse.results || permissionsResponse || []);
        if (!selectedRoleId && roleList[0]) {
          setSelectedRoleId(roleList[0].id);
          setDraft({ name: roleList[0].name || "", description: roleList[0].description || "", permissions: roleList[0].assigned_permissions || [] });
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load roles right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [canManagePermissionAssignments]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0] || null;
  const canEditSelectedRole = canEditRole(loggedInRole, selectedRole?.name);
  const canEditSelectedPermissions = canEditPermissions(loggedInRole, selectedRole?.name);

  useEffect(() => {
    if (!selectedRole) {
      return;
    }
    if (!isCreating && !isEditing) {
      setDraft({ name: selectedRole.name || "", description: selectedRole.description || "", permissions: selectedRole.assigned_permissions || [] });
    }
  }, [isCreating, isEditing, selectedRole]);

  const visiblePermissionGroups = useMemo(() => {
    return permissionSections.map((section) => ({
      ...section,
      items: permissions.filter((permission) => section.keys.includes(permission.codename)),
    }));
  }, [permissions]);

  function resetForm(role = null) {
    if (role) {
      setDraft({ name: role.name || "", description: role.description || "", permissions: role.assigned_permissions || [] });
    } else {
      setDraft(emptyDraft);
    }
    setIsCreating(false);
    setIsEditing(false);
  }

  function selectRole(role) {
    setSelectedRoleId(role.id);
    setDraft({ name: role.name || "", description: role.description || "", permissions: role.assigned_permissions || [] });
    setIsCreating(false);
    setIsEditing(false);
  }

  function togglePermission(codename) {
    setDraft((current) => ({
      ...current,
      permissions: current.permissions.includes(codename)
        ? current.permissions.filter((item) => item !== codename)
        : [...current.permissions, codename],
    }));
  }

  async function handleSave() {
    if (!isCreating && (!selectedRole || !canEditSelectedPermissions)) {
      toast.error("You do not have permission to edit this role.");
      return;
    }
    if (isCreating && !canManageRoles) {
      toast.error("Only administrators can create roles.");
      return;
    }
    if (isCreating && !draft.name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      let savedRole;
      if (isCreating) {
        savedRole = await createRole({ name: draft.name.trim(), description: draft.description.trim(), permissions: draft.permissions });
      } else {
        savedRole = canManageRoles
          ? await updateRole(selectedRole.id, { name: draft.name.trim(), description: draft.description.trim() })
          : selectedRole;
        await updateRolePermissions(selectedRole.id, draft.permissions);
      }

      const rolePayload = {
        ...savedRole,
        assigned_permissions: draft.permissions,
      };

      setRoles((current) => {
        if (isCreating) {
          return [rolePayload, ...current.filter((role) => role.id !== rolePayload.id)];
        }
        return current.map((role) => (role.id === rolePayload.id ? rolePayload : role));
      });
      setSelectedRoleId(rolePayload.id);
      setDraft({ name: rolePayload.name || "", description: rolePayload.description || "", permissions: rolePayload.assigned_permissions || [] });
      setIsCreating(false);
      setIsEditing(false);
      toast.success(isCreating ? "Role created." : "Role updated.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Unable to save the role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRole) {
      return;
    }
    if (selectedRole.is_system) {
      toast.error("System roles cannot be deleted.");
      return;
    }
    const confirmed = window.confirm(`Delete ${selectedRole.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteRole(selectedRole.id);
      const remainingRoles = roles.filter((role) => role.id !== selectedRole.id);
      setRoles(remainingRoles);
      const nextRole = remainingRoles[0] || null;
      if (nextRole) {
        setSelectedRoleId(nextRole.id);
        setDraft({ name: nextRole.name || "", description: nextRole.description || "", permissions: nextRole.assigned_permissions || [] });
      } else {
        setSelectedRoleId(null);
        setDraft(emptyDraft);
      }
      setIsCreating(false);
      setIsEditing(false);
      toast.success("Role removed.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete the role.");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#111827] dark:shadow-slate-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-500">Role governance</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Roles & Permissions</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create, edit, and assign permissions from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManageRoles ? (
              <button
                onClick={() => {
                  setIsCreating(true);
                  setIsEditing(true);
                  setSelectedRoleId(null);
                  setDraft(emptyDraft);
                }}
                className="flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                <Plus size={16} />
                Create Role
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Roles</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">{roles.length}</span>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />)
            ) : roles.length ? (
              roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${selectedRoleId === role.id ? "border-teal-500 bg-teal-500/10 text-slate-900 dark:text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{role.name}</span>
                    {role.is_system ? <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">System</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.description || "No description yet"}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No roles available yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-[#1A2332] dark:shadow-slate-950/20">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center text-slate-500 dark:text-slate-400">Loading role details…</div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedRole?.name || "Create a role"}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedRole?.description || "Set the role name, description, and available permissions."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isCreating && !isEditing && selectedRole ? (
                    <>
                      {canEditSelectedRole ? (
                        <button onClick={() => { setIsEditing(true); setIsCreating(false); }} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
                          <PencilLine size={16} />
                          Edit
                        </button>
                      ) : null}
                      {canManageRoles && !selectedRole?.is_system ? (
                        <button onClick={handleDelete} className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-500/10 dark:text-rose-300">
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

                <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Role name</span>
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      disabled={!isCreating && (!isEditing || !canManageRoles)}
                      placeholder="e.g. Finance Manager"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Description</span>
                    <input
                      value={draft.description}
                      onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                      disabled={!isCreating && (!isEditing || !canManageRoles)}
                      placeholder="Short summary of the role"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                    />
                  </label>
                </div>

                {(isCreating || isEditing) ? (
                  <div className="flex flex-wrap gap-2">
                    {canEditSelectedPermissions || isCreating ? <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? "Saving..." : "Save role"}
                    </button> : null}
                    <button onClick={() => resetForm(selectedRole)} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </div>
                ) : null}

                {canManagePermissionAssignments ? <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <ShieldCheck size={16} className="text-teal-500" />
                    Permission assignments
                  </div>

                  {isCreating || isEditing ? (
                    <div className="space-y-3">
                      {visiblePermissionGroups.map((section) => (
                        <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0E1420]">
                          <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{section.title}</div>
                          <div className="space-y-2">
                            {section.items.map((permission) => {
                              const checked = draft.permissions.includes(permission.codename);
                              return (
                                <label key={permission.codename} className={`flex ${canEditSelectedPermissions ? "cursor-pointer" : ""} items-start gap-3 rounded-2xl border px-3 py-2.5 transition ${checked ? "border-teal-500 bg-teal-500/10" : "border-slate-200 bg-transparent dark:border-slate-700"}`}>
                                  <input type="checkbox" checked={checked} onChange={() => canEditSelectedPermissions && togglePermission(permission.codename)} disabled={!canEditSelectedPermissions} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                  <div>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{permission.codename}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{permission.description || "Permission included in this role."}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visiblePermissionGroups.map((section) => {
                        const assigned = section.items.filter((permission) => (selectedRole?.assigned_permissions || []).includes(permission.codename));
                        return (
                          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0E1420]">
                            <div className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{section.title}</div>
                            {assigned.length ? (
                              <div className="space-y-2">
                                {assigned.map((permission) => (
                                  <div key={permission.codename} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{permission.codename}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{permission.description || "Permission included in this role."}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">No permissions assigned yet.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Roles;

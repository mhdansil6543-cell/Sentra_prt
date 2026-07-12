export function getPermissionsFromUser(user) {
  if (!user) {
    return [];
  }

  const permissions = user.permissions || user.assigned_permissions || [];
  return Array.isArray(permissions) ? permissions : [];
}

export function hasPermission(user, permission) {
  if (!user) {
    return false;
  }

  if (getPrimaryRole(user) === "Admin") {
    return true;
  }

  return getPermissionsFromUser(user).includes(permission);
}

export function hasAnyPermission(user, permissions) {
  if (!Array.isArray(permissions) || !permissions.length) {
    return false;
  }

  return permissions.some((permission) => hasPermission(user, permission));
}

export function canViewUsers(user) {
  return hasPermission(user, "users.view");
}

export function getPrimaryRole(user) {
  const roles = user?.roles || [];
  if (roles.includes("Admin")) return "Admin";
  if (roles.includes("Manager")) return "Manager";
  if (roles.includes("Viewer")) return "Viewer";
  return user?.is_superuser ? "Admin" : "Viewer";
}

export function canManageUser(user, targetUser) {
  if (!canEditUsers(user) || !targetUser) return false;
  return getPrimaryRole(user) === "Admin" || !((targetUser.roles || []).includes("Admin"));
}

export function canCreateUsers(user) {
  return hasPermission(user, "users.create");
}

export function canEditUsers(user) {
  return hasPermission(user, "users.edit");
}

export function canDeleteUsers(user) {
  return hasPermission(user, "users.delete");
}

export function canAssignRoles(user) {
  return canEditUsers(user);
}

export function canExportUsers(user) {
  return hasPermission(user, "users.export");
}

export function canViewRoles(user) {
  return hasPermission(user, "roles.view");
}

export function canManageRoles(user) {
  return getPrimaryRole(user) === "Admin";
}

export function canViewPermissions(user) {
  return hasPermission(user, "permissions.view");
}

export function canViewAudit(user) {
  return hasPermission(user, "audit.view");
}

export const canViewAuditLogs = canViewAudit;

export function canManagePermissions(user) {
  return canViewRoles(user);
}

export function canEditRole(loggedInRole, selectedRole) {
  // Accept a role name as the public API. Supporting a user object keeps
  // existing callers safe while all role-editor callers use the explicit
  // two-role form below.
  const actorRole = typeof loggedInRole === "string"
    ? loggedInRole
    : getPrimaryRole(loggedInRole);
  const targetRole = typeof selectedRole === "string"
    ? selectedRole
    : selectedRole?.name;

  if (actorRole === "Admin") return true;
  if (actorRole === "Manager") return targetRole === "Manager" || targetRole === "Viewer";
  if (actorRole === "Viewer") return targetRole === "Viewer";
  return false;
}

export const canEditPermissions = canEditRole;

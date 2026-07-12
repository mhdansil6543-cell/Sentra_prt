from rest_framework.permissions import BasePermission

from .services import PermissionService


def get_user_role_names(user):
    if not user or not getattr(user, "is_authenticated", False):
        return set()
    return set(user.user_roles.select_related("role").values_list("role__name", flat=True))


def get_highest_role(user):
    roles = get_user_role_names(user)
    if "Admin" in roles:
        return "Admin"
    if "Manager" in roles:
        return "Manager"
    if "Viewer" in roles:
        return "Viewer"
    # Preserve bootstrap/Django-admin access for legacy superusers that have
    # not yet been assigned one of the three RBAC system roles. An explicit
    # RBAC role always takes precedence over this legacy flag.
    if getattr(user, "is_superuser", False):
        return "Admin"
    return None


def is_admin(user):
    return get_highest_role(user) == "Admin"


def is_manager(user):
    return get_highest_role(user) == "Manager"


def is_viewer(user):
    return get_highest_role(user) == "Viewer"


def can_manage_user(actor, target):
    if not actor or not getattr(actor, "is_authenticated", False):
        return False

    if is_admin(actor):
        return True

    # Managers may administer peer manager accounts and viewer accounts, but
    # must never be able to change an Administrator account.
    if is_manager(actor):
        return not is_admin(target)

    return False


def can_edit_role(actor, role):
    """Return whether an actor may change the selected system role.

    Custom roles remain Administrator-managed because they have no defined
    place in the three-level system hierarchy.
    """
    if not actor or not getattr(actor, "is_authenticated", False) or not role:
        return False
    if is_admin(actor):
        return True
    if role.name not in {"Admin", "Manager", "Viewer"}:
        return False
    if is_manager(actor):
        return role.name in {"Manager", "Viewer"}
    if is_viewer(actor):
        return role.name == "Viewer"
    return False


def can_create_or_delete_roles(actor):
    return is_admin(actor)


class RBACPermission(BasePermission):
    permission_name = None

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if is_admin(request.user):
            return True

        permission_name = getattr(view, "required_permission", None) or self.permission_name
        if not permission_name:
            return False

        return PermissionService.resolve_permission(
            request.user,
            permission_name,
            request=request,
        )


class HasPermission(RBACPermission):
    pass


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return is_manager(request.user)


class IsViewer(BasePermission):
    def has_permission(self, request, view):
        return is_viewer(request.user)


class CanManageUsers(RBACPermission):
    permission_name = "users.edit"


class CanExportUsers(RBACPermission):
    permission_name = "users.export"


class CanAssignRoles(RBACPermission):
    permission_name = "roles.manage"


class CanManageRoles(RBACPermission):
    permission_name = "roles.manage"


class CanViewAuditLogs(RBACPermission):
    permission_name = "audit.view"

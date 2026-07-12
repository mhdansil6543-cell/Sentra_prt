from django.test import TestCase

from accounts.models import User
from rbac.models import Permission, Role, RolePermission, UserRole

from .permissions import HasPermission
from .services import PermissionService


class PermissionSystemTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="rbac@example.com",
            full_name="RBAC User",
            password="strongpassword123",
        )
        self.role, _ = Role.objects.get_or_create(
            name="Viewer-Test-Role",
            defaults={"description": "Viewer role", "is_system": True},
        )
        self.permission, _ = Permission.objects.get_or_create(
            codename="users.view",
            defaults={"description": "View users"},
        )
        RolePermission.objects.get_or_create(role=self.role, permission=self.permission)
        UserRole.objects.get_or_create(user=self.user, role=self.role)

    def test_permission_service_resolves_role_permissions(self):
        self.assertTrue(PermissionService.resolve_permission(self.user, "users.view"))
        self.assertFalse(PermissionService.resolve_permission(self.user, "users.create"))

    def test_has_permission_checks_required_permission(self):
        request = type("Request", (), {"user": self.user, "method": "GET"})()
        view = type("View", (), {"required_permission": "users.view"})()

        self.assertTrue(HasPermission().has_permission(request, view))

        denied_view = type("View", (), {"required_permission": "users.create"})()
        self.assertFalse(HasPermission().has_permission(request, denied_view))

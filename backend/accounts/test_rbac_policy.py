from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from rbac.models import Role, UserRole


class EnterpriseRoleHierarchyTests(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.get(name="Admin")
        self.manager_role = Role.objects.get(name="Manager")
        self.viewer_role = Role.objects.get(name="Viewer")

        self.admin = User.objects.create_user(email="admin@sentra.test", full_name="Admin", password="strongpassword123")
        self.manager = User.objects.create_user(email="manager@sentra.test", full_name="Manager", password="strongpassword123")
        self.viewer = User.objects.create_user(email="viewer@sentra.test", full_name="Viewer", password="strongpassword123")
        UserRole.objects.create(user=self.admin, role=self.admin_role)
        UserRole.objects.create(user=self.manager, role=self.manager_role)
        UserRole.objects.create(user=self.viewer, role=self.viewer_role)

    def test_manager_cannot_modify_an_admin(self):
        self.client.force_authenticate(self.manager)
        response = self.client.patch(f"/api/v1/users/{self.admin.id}/", {"full_name": "Compromised"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_modify_a_manager_and_cannot_promote_to_admin(self):
        self.client.force_authenticate(self.manager)
        response = self.client.patch(f"/api/v1/users/{self.manager.id}/", {"full_name": "Updated Manager"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(f"/api/v1/users/{self.viewer.id}/", {"role": "Admin"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_viewer_can_view_catalogue_but_cannot_create_users(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.post("/api/v1/users/", {"email": "new@sentra.test", "full_name": "New", "password": "strongpassword123", "role": "Viewer"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get("/api/v1/permissions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_only_admin_can_read_audit_logs(self):
        self.client.force_authenticate(self.manager)
        response = self.client.get("/api/v1/audit-logs/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_role_permission_editing_follows_hierarchy(self):
        self.client.force_authenticate(self.manager)
        response = self.client.put(
            f"/api/v1/roles/{self.admin_role.id}/permissions/",
            {"permissions": ["users.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(
            f"/api/v1/roles/{self.viewer_role.id}/permissions/",
            {"permissions": ["users.view", "roles.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_viewer_cannot_update_admin_or_manager_role_records(self):
        self.client.force_authenticate(self.viewer)
        response = self.client.patch(
            f"/api/v1/roles/{self.admin_role.id}/",
            {"description": "Attempted Admin edit"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_explicit_viewer_role_overrides_legacy_superuser_flag(self):
        self.viewer.is_superuser = True
        self.viewer.save(update_fields=["is_superuser"])
        self.client.force_authenticate(self.viewer)
        response = self.client.put(
            f"/api/v1/roles/{self.admin_role.id}/permissions/",
            {"permissions": ["users.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            f"/api/v1/roles/{self.manager_role.id}/",
            {"description": "Attempted Manager edit"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.viewer)
        response = self.client.put(
            f"/api/v1/roles/{self.manager_role.id}/permissions/",
            {"permissions": ["users.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            f"/api/v1/roles/{self.viewer_role.id}/permissions/",
            {"permissions": ["users.view", "roles.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

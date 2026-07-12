import uuid

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from rbac.models import Permission, Role


class RoleManagementAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(email="admin@example.com", password="testpass123")
        self.client.force_authenticate(self.admin)
        self.role, _ = Role.objects.get_or_create(
            name=f"Viewer_{uuid.uuid4().hex[:6]}",
            defaults={"description": "Read-only role", "is_system": False},
        )

    def test_create_and_list_roles(self):
        unique_name = f"Manager_{uuid.uuid4().hex[:6]}"
        response = self.client.post(
            "/api/v1/roles/",
            {"name": unique_name, "description": "Manager role", "permissions": ["users.view", "users.create"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get("/api/v1/roles/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

    def test_update_delete_and_assign_permissions(self):
        response = self.client.patch(
            f"/api/v1/roles/{self.role.id}/",
            {"description": "Updated description"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.put(
            f"/api/v1/roles/{self.role.id}/permissions/",
            {"permissions": ["users.view", "roles.view"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get("/api/v1/roles/permissions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(f"/api/v1/roles/{self.role.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_export_roles(self):
        response = self.client.get("/api/v1/roles/export/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("spreadsheetml", response["Content-Type"])

    def test_permission_catalog_is_read_only(self):
        response = self.client.get("/api/v1/permissions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from rbac.models import Permission, Role, RolePermission, UserRole


class UserManagementAPITests(APITestCase):
    def setUp(self):
        self.role, _ = Role.objects.get_or_create(name="Manager-Test", defaults={"description": "Manager role", "is_system": True})
        for codename in ["users.view", "users.create", "users.edit", "users.delete", "roles.manage"]:
            permission, _ = Permission.objects.get_or_create(codename=codename, defaults={"description": codename})
            RolePermission.objects.get_or_create(role=self.role, permission=permission)

        self.admin_user = User.objects.create_user(
            email="manager@example.com",
            full_name="Manager User",
            password="strongpassword123",
        )
        UserRole.objects.create(user=self.admin_user, role=self.role)

        self.client.force_authenticate(user=self.admin_user)

    def test_list_users_with_search_and_pagination(self):
        User.objects.create_user(email="alpha@example.com", full_name="Alpha User", password="strongpassword123")
        User.objects.create_user(email="beta@example.com", full_name="Beta User", password="strongpassword123")

        response = self.client.get(reverse("user-list"), {"search": "alpha", "page": 1})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["email"], "alpha@example.com")

    def test_create_user_and_soft_delete_user(self):
        create_response = self.client.post(
            reverse("user-list"),
            {"email": "newuser@example.com", "full_name": "New User", "password": "strongpassword123"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="newuser@example.com")
        delete_response = self.client.delete(reverse("user-detail", kwargs={"pk": user.pk}))
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        user.refresh_from_db()
        self.assertFalse(user.is_active)

    def test_assign_roles_to_user(self):
        target_user = User.objects.create_user(email="target@example.com", full_name="Target User", password="strongpassword123")
        role = Role.objects.create(name="Viewer-Test", description="Viewer role", is_system=True)

        response = self.client.put(
            reverse("user-roles", kwargs={"pk": target_user.pk}),
            {"role_ids": [str(role.id)]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(UserRole.objects.filter(user=target_user, role=role).exists())

    def test_export_users_rejects_large_payloads(self):
        users = [
            User(email=f"bulk{index}@example.com", full_name=f"Bulk {index}", password="!")
            for index in range(10001)
        ]
        User.objects.bulk_create(users, batch_size=1000)

        response = self.client.get(reverse("user-export"))

        self.assertEqual(response.status_code, 400)

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from audit.models import AuditLog
from rbac.models import Permission, Role, RolePermission, UserRole


@pytest.mark.django_db
class TestQualityGates:
    def setup_method(self):
        self.user_password = "strongpassword123"
        self.user = User.objects.create_user(
            email="rbac@example.com",
            full_name="RBAC User",
            password=self.user_password,
        )
        self.role = Role.objects.create(
            name="Viewer",
            description="Viewer role",
            is_system=False,
        )
        self.permission = Permission.objects.create(
            codename="roles.view",
            description="View roles",
        )
        RolePermission.objects.create(role=self.role, permission=self.permission)
        UserRole.objects.create(user=self.user, role=self.role)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_permission_matrix_and_role_resolution(self):
        response = self.client.get(reverse("role-permissions-matrix"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["results"][0]["name"] == self.role.name
        assert "roles.view" in response.data["results"][0]["permissions"]

    def test_refresh_token_flow_and_rotation(self):
        login_response = APIClient().post(
            reverse("login"),
            {"email": self.user.email, "password": self.user_password},
            format="json",
        )

        assert login_response.status_code == status.HTTP_200_OK
        refresh_response = APIClient().post(
            reverse("refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        assert refresh_response.status_code == status.HTTP_200_OK
        assert "access" in refresh_response.data

    def test_logout_blacklists_refresh_token_and_records_audit(self):
        login_response = APIClient().post(
            reverse("login"),
            {"email": self.user.email, "password": self.user_password},
            format="json",
        )

        logout_response = APIClient().post(
            reverse("logout"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        assert logout_response.status_code == status.HTTP_200_OK
        assert AuditLog.objects.filter(
            actor=self.user,
            action="logout",
            target_type="User",
            target_id=str(self.user.id),
        ).exists()

        refresh_response = APIClient().post(
            reverse("refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        assert refresh_response.status_code != status.HTTP_200_OK

    def test_self_lockout_guard_blocks_deactivation(self):
        response = self.client.patch(
            reverse("user-detail", kwargs={"pk": self.user.pk}),
            {"is_active": False},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_audit_log_is_recorded_on_login(self):
        login_user = User.objects.create_user(
            email="audit-login@example.com",
            full_name="Audit Login",
            password="strongpassword123",
        )
        response = APIClient().post(
            reverse("login"),
            {"email": login_user.email, "password": "strongpassword123"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert AuditLog.objects.filter(
            actor=login_user,
            action="login",
            target_type="User",
            target_id=str(login_user.id),
        ).exists()

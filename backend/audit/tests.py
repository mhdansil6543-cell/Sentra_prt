from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from audit.models import AuditLog


class AuditLoggingAPITests(APITestCase):
    def test_login_creates_audit_log(self):
        user = User.objects.create_user(
            email="audit-login@example.com",
            full_name="Audit Login",
            password="strongpassword123",
        )

        response = self.client.post(
            reverse("login"),
            {"email": user.email, "password": "strongpassword123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            AuditLog.objects.filter(action="login", target_type="User", target_id=str(user.id)).exists()
        )

    def test_logout_creates_audit_log(self):
        user = User.objects.create_user(
            email="audit-logout@example.com",
            full_name="Audit Logout",
            password="strongpassword123",
        )

        login_response = self.client.post(
            reverse("login"),
            {"email": user.email, "password": "strongpassword123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        logout_response = self.client.post(
            reverse("logout"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            AuditLog.objects.filter(action="logout", target_type="User", target_id=str(user.id)).exists()
        )

    def test_audit_logs_are_listed_for_authorized_users(self):
        admin = User.objects.create_superuser(email="audit-admin@example.com", password="strongpassword123")
        self.client.force_authenticate(admin)

        AuditLog.objects.create(
            actor=admin,
            action="user.create",
            target_type="User",
            target_id=str(admin.id),
            changes={"old": {}, "new": {"email": admin.email}},
            ip="127.0.0.1",
        )

        response = self.client.get(reverse("audit-log-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 1)

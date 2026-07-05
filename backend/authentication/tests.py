from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


class AuthenticationAPITests(APITestCase):

    def test_register_creates_user_and_returns_tokens(self):
        response = self.client.post(
            reverse("register"),
            {
                "email": "newuser@example.com",
                "full_name": "New User",
                "password": "strongpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "newuser@example.com")

    def test_login_returns_tokens_for_valid_credentials(self):
        User.objects.create_user(
            email="login@example.com",
            full_name="Login User",
            password="strongpassword123",
        )

        response = self.client.post(
            reverse("login"),
            {"email": "login@example.com", "password": "strongpassword123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_returns_new_access_token(self):
        User.objects.create_user(
            email="refresh@example.com",
            full_name="Refresh User",
            password="strongpassword123",
        )

        login_response = self.client.post(
            reverse("login"),
            {"email": "refresh@example.com", "password": "strongpassword123"},
            format="json",
        )

        response = self.client.post(
            reverse("refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_returns_authenticated_user_profile(self):
        User.objects.create_user(
            email="me@example.com",
            full_name="Me User",
            password="strongpassword123",
        )

        login_response = self.client.post(
            reverse("login"),
            {"email": "me@example.com", "password": "strongpassword123"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "me@example.com")
        self.assertEqual(response.data["full_name"], "Me User")

    def test_logout_blacklists_refresh_token(self):
        User.objects.create_user(
            email="logout@example.com",
            full_name="Logout User",
            password="strongpassword123",
        )

        login_response = self.client.post(
            reverse("login"),
            {"email": "logout@example.com", "password": "strongpassword123"},
            format="json",
        )

        logout_response = self.client.post(
            reverse("logout"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(
            reverse("refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertNotEqual(refresh_response.status_code, status.HTTP_200_OK)

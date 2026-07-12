from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import OpenApiResponse, extend_schema

from audit.models import AuditLog
from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    TokenResponseSerializer,
    UserSerializer,
)


class RegisterView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def _log_event(self, user, action, old_data, new_data):
        AuditLog.objects.create(
            actor=user,
            action=action,
            target_type="User",
            target_id=str(user.id),
            changes={"old": old_data or {}, "new": new_data or {}},
            ip=self.request.META.get("REMOTE_ADDR"),
        )

    @extend_schema(
        tags=["Authentication"],
        summary="Register a new user",
        description="Create a new account and return JWT tokens for the newly created user.",
        request=RegisterSerializer,
        responses={201: TokenResponseSerializer, 400: OpenApiResponse(description="Validation error")},
    )
    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        self._log_event(user, "user.create", None, serializer.validated_data)

        token_serializer = LoginSerializer(
            data={
                "email": user.email,
                "password": request.data.get("password"),
            }
        )
        token_serializer.is_valid(raise_exception=True)

        return Response(
            {
                "access": token_serializer.validated_data["access"],
                "refresh": token_serializer.validated_data["refresh"],
                "user": token_serializer.validated_data["user"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):

    serializer_class = LoginSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Authentication"],
        summary="Authenticate a user",
        description="Sign in with email and password to receive access and refresh tokens.",
        request=LoginSerializer,
        responses={200: TokenResponseSerializer, 400: OpenApiResponse(description="Invalid credentials")},
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            user = self.get_user_from_request(request)
            if user is not None:
                self._log_event(user, "login", None, {"email": user.email})
        return response

    def get_user_from_request(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return serializer.user

    def _log_event(self, user, action, old_data, new_data):
        AuditLog.objects.create(
            actor=user,
            action=action,
            target_type="User",
            target_id=str(user.id),
            changes={"old": old_data or {}, "new": new_data or {}},
            ip=self.request.META.get("REMOTE_ADDR"),
        )


class RefreshView(TokenRefreshView):

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Refresh an access token",
        description="Exchange a valid refresh token for a new access token.",
        request=TokenRefreshSerializer,
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = LogoutSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Logout a user",
        description="Blacklist the supplied refresh token to invalidate the user session.",
        request=LogoutSerializer,
        responses={200: OpenApiResponse(description="Successfully logged out"), 400: OpenApiResponse(description="Invalid refresh token")},
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None
        try:
            user = self._get_user_from_token(refresh_token)
        except Exception:
            user = None

        self._log_event(user, "logout", None, {"refresh_token": True})

        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )

    def _get_user_from_token(self, refresh_token):
        token = RefreshToken(refresh_token)
        user_id = token.payload.get("user_id")
        from accounts.models import User
        return User.objects.filter(id=user_id).first()

    def _log_event(self, user, action, old_data, new_data):
        if user is None:
            return
        AuditLog.objects.create(
            actor=user,
            action=action,
            target_type="User",
            target_id=str(user.id),
            changes={"old": old_data or {}, "new": new_data or {}},
            ip=self.request.META.get("REMOTE_ADDR"),
        )


class MeView(APIView):

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        tags=["Authentication"],
        summary="Get the current authenticated user",
        description="Return the profile information for the currently authenticated user.",
        responses={200: UserSerializer},
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
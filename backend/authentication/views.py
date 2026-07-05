from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

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


class RefreshView(TokenRefreshView):

    authentication_classes = []
    permission_classes = [AllowAny]


class LogoutView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

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

        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
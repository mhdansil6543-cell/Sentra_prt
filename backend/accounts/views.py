from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from audit.models import AuditLog
from common.permissions import HasPermission, can_manage_user, is_admin, is_manager
from common.services import ExcelExportService
from rbac.models import Role, UserRole

from .models import User
from .serializers import UserCreateSerializer, UserListSerializer, UserRoleSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["email", "full_name"]
    ordering_fields = ["email", "full_name", "created_at", "updated_at", "last_login"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-created_at")

        if self.request is not None:
            is_active_param = self.request.query_params.get("is_active")
            if is_active_param is not None:
                queryset = queryset.filter(is_active=is_active_param.lower() in {"1", "true", "yes", "on"})

            is_staff_param = self.request.query_params.get("is_staff")
            if is_staff_param is not None:
                queryset = queryset.filter(is_staff=is_staff_param.lower() in {"1", "true", "yes", "on"})

            role_name = self.request.query_params.get("role")
            if role_name:
                queryset = queryset.filter(user_roles__role__name__iexact=role_name)

        return queryset

    def get_permissions(self):
        if self.action in {"list"}:
            self.required_permission = "users.view"
        elif self.action in {"create"}:
            self.required_permission = "users.create"
        elif self.action in {"update", "partial_update"}:
            self.required_permission = "users.edit"
        elif self.action in {"destroy"}:
            self.required_permission = "users.delete"
        elif self.action == "assign_roles":
            # Assigning a user's system role is part of user administration;
            # Managers may assign Manager/Viewer but serializers reject Admin.
            self.required_permission = "users.edit"
        elif self.action == "export":
            self.required_permission = "users.export"
        else:
            self.required_permission = "users.view"
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in {"update", "partial_update"}:
            return UserUpdateSerializer
        if self.action == "assign_roles":
            return UserRoleSerializer
        return UserListSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        self._log_change(user, "user.create", None, serializer.validated_data)

    def perform_update(self, serializer):
        instance = serializer.instance

        if not can_manage_user(self.request.user, instance):
            raise PermissionDenied("You do not have permission to modify this user.")

        if instance.pk == self.request.user.pk and any(
            field in serializer.validated_data and serializer.validated_data[field] is False
            for field in ["is_active", "is_staff"]
        ):
            raise serializers.ValidationError("You cannot change your own account status.")

        old_data = {
            field: getattr(serializer.instance, field)
            for field in ["email", "full_name", "is_active", "is_staff"]
            if hasattr(serializer.instance, field)
        }
        user = serializer.save()
        self._log_change(user, "user.update", old_data, serializer.validated_data)

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise serializers.ValidationError(
                "You cannot delete your own account."
            )

        if not can_manage_user(self.request.user, instance):
            raise PermissionDenied("You do not have permission to delete this user.")

        old_data = {
            "email": instance.email,
            "full_name": instance.full_name,
            "is_active": instance.is_active,
        }

        instance.is_active = False
        instance.save()

        self._log_change(
            instance,
            "user.delete",
            old_data,
            {"is_active": False},
        )

    def _log_change(self, user, action, old_data, new_data):
        target_id = str(user.id) if user is not None else ""
        AuditLog.objects.create(
            actor=self.request.user,
            action=action,
            target_type="User",
            target_id=target_id,
            changes={
                "old": old_data or {},
                "new": new_data or {},
            },
            ip=self.request.META.get("REMOTE_ADDR"),
        )

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        self.request.required_permission = "users.view"
        try:
            return ExcelExportService.export_queryset(
                request,
                queryset,
                "users.xlsx",
                ["id", "email", "full_name", "is_active", "is_staff", "created_at", "updated_at"],
                lambda qs: [
                    [
                        str(user.id),
                        user.email,
                        user.full_name,
                        user.is_active,
                        user.is_staff,
                        user.created_at,
                        user.updated_at,
                    ]
                    for user in qs
                ],
                "Users",
                "users.view",
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["put"], url_path="roles")
    def assign_roles(self, request, pk=None, *args, **kwargs):
        user = self.get_object()

        if not can_manage_user(request.user, user):
            raise PermissionDenied("You do not have permission to update this user's roles.")

        serializer = UserRoleSerializer(data=request.data, context={"user": user, "request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self._log_change(user, "role.assignment", {"roles": []}, {"roles": request.data.get("role_ids", [])})
        return Response({"detail": "Roles updated successfully."}, status=status.HTTP_200_OK)

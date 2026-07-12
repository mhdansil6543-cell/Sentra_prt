from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from audit.models import AuditLog
from common.permissions import HasPermission, can_create_or_delete_roles, can_edit_role
from common.services import ExcelExportService
from rbac.models import Permission, Role, RolePermission


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "description")
        read_only_fields = fields


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("name")
    serializer_class = None
    permission_classes = [IsAuthenticated, HasPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "description", "is_system"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve", "permissions_matrix", "export"}:
            self.required_permission = "roles.view"
        elif self.action in {"create"}:
            self.required_permission = "roles.view"
        elif self.action in {"update", "partial_update", "assign_permissions"}:
            self.required_permission = "roles.view"
        elif self.action in {"destroy"}:
            self.required_permission = "roles.view"
        else:
            self.required_permission = "roles.view"
        return super().get_permissions()

    def get_queryset(self):
        queryset = Role.objects.all().order_by("name")
        is_system_param = self.request.query_params.get("is_system")
        if is_system_param is not None:
            queryset = queryset.filter(is_system=is_system_param.lower() in {"1", "true", "yes", "on"})
        return queryset

    def get_serializer_class(self):
        if self.action == "assign_permissions":
            return RolePermissionSerializer
        return RoleSerializer

    def perform_create(self, serializer):
        if not can_create_or_delete_roles(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can create roles.")
        role = serializer.save()
        self._log_change(role, "role.create", None, serializer.validated_data)

    def perform_update(self, serializer):
        if not can_edit_role(self.request.user, serializer.instance):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot edit this role.")
        if (
            serializer.instance.is_system
            and "name" in serializer.validated_data
            and serializer.validated_data["name"] != serializer.instance.name
        ):
            raise serializers.ValidationError("System role names cannot be changed.")
        old_data = {field: getattr(serializer.instance, field) for field in ["name", "description", "is_system"] if hasattr(serializer.instance, field)}
        role = serializer.save()
        self._log_change(role, "role.update", old_data, serializer.validated_data)

    def perform_destroy(self, instance):
        if not can_create_or_delete_roles(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can delete roles.")
        if instance.is_system:
            raise serializers.ValidationError("System roles cannot be deleted.")
        self._log_change(instance, "role.delete", {"name": instance.name}, {"deleted": True})
        instance.delete()

    def _log_change(self, role, action, old_data, new_data):
        target_id = str(role.id) if role is not None else ""
        AuditLog.objects.create(
            actor=self.request.user,
            action=action,
            target_type="Role",
            target_id=target_id,
            changes={"old": old_data or {}, "new": new_data or {}},
            ip=self.request.META.get("REMOTE_ADDR"),
        )

    @action(detail=False, methods=["get"], url_path="permissions")
    def permissions_matrix(self, request, *args, **kwargs):
        roles = self.filter_queryset(self.get_queryset())
        permissions = Permission.objects.all().order_by("codename")
        matrix = []
        for role in roles:
            assigned = set(role.role_permissions.values_list("permission__codename", flat=True))
            matrix.append({
                "id": str(role.id),
                "name": role.name,
                "is_system": role.is_system,
                "permissions": [permission.codename for permission in permissions if permission.codename in assigned],
            })
        return Response({"count": len(matrix), "results": matrix})

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request, *args, **kwargs):
        roles = self.filter_queryset(self.get_queryset())
        self.request.required_permission = "roles.view"
        try:
            return ExcelExportService.export_queryset(
                request,
                roles,
                "roles.xlsx",
                ["id", "name", "description", "is_system"],
                lambda qs: [
                    [str(role.id), role.name, role.description, role.is_system]
                    for role in qs
                ],
                "Roles",
                "roles.view",
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["put"], url_path="permissions")
    def assign_permissions(self, request, pk=None, *args, **kwargs):
        role = self.get_object()
        if not can_edit_role(request.user, role):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot change this role's permissions.")
        serializer = RolePermissionSerializer(data=request.data, context={"role": role})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self._log_change(role, "permission.assignment", {"permissions": []}, {"permissions": request.data.get("permissions", [])})
        return Response({"detail": "Permissions updated successfully."}, status=status.HTTP_200_OK)


class PermissionCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by("codename")
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["codename", "description"]
    ordering_fields = ["codename", "description"]
    ordering = ["codename"]

    def get_permissions(self):
        # Editors need the catalogue to select permission assignments. Access
        # to a *role* remains constrained by can_edit_role above.
        self.required_permission = "roles.view"
        return super().get_permissions()


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.ListField(child=serializers.CharField(), write_only=True, required=False, allow_empty=True)
    assigned_permissions = serializers.SerializerMethodField()
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "description",
            "is_system",
            "permissions",
            "assigned_permissions",
            "users_count",
        )
        read_only_fields = ("id", "is_system", "assigned_permissions", "users_count")

    def get_assigned_permissions(self, obj):
        return [
            role_permission.permission.codename
            for role_permission in obj.role_permissions.select_related("permission").all()
        ]

    def get_users_count(self, obj):
        return obj.user_roles.count()

    def create(self, validated_data):
        permissions = validated_data.pop("permissions", [])
        role = Role.objects.create(**validated_data)
        for permission_codename in permissions:
            permission = Permission.objects.filter(codename=permission_codename).first()
            if permission is not None:
                RolePermission.objects.create(role=role, permission=permission)
        return role

    def update(self, instance, validated_data):
        permissions = validated_data.pop("permissions", None)
        role = super().update(instance, validated_data)
        if permissions is not None:
            RolePermission.objects.filter(role=role).delete()
            for permission_codename in permissions:
                permission = Permission.objects.filter(codename=permission_codename).first()
                if permission is not None:
                    RolePermission.objects.create(role=role, permission=permission)
        return role


class RolePermissionSerializer(serializers.Serializer):
    permissions = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)

    def validate_permissions(self, value):
        if not value:
            return []
        permission_names = []
        for permission_name in value:
            permission_names.append(str(permission_name))
        existing = Permission.objects.filter(codename__in=permission_names)
        if existing.count() != len(permission_names):
            raise serializers.ValidationError("One or more permissions are invalid.")
        return permission_names

    def create(self, validated_data):
        role = self.context["role"]
        RolePermission.objects.filter(role=role).delete()
        for permission_codename in validated_data.get("permissions", []):
            permission = Permission.objects.get(codename=permission_codename)
            RolePermission.objects.create(role=role, permission=permission)
        return role

    def update(self, instance, validated_data):
        return self.create(validated_data)

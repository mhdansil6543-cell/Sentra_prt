import io
import json
from functools import lru_cache
from datetime import datetime

from django.http import HttpResponse
from openpyxl import Workbook

from audit.models import AuditLog
from rbac.models import Permission


class ExcelExportService:
    MAX_ROWS = 10000

    @classmethod
    def export_queryset(
        cls,
        request,
        queryset,
        filename,
        headers,
        rows,
        resource_name,
        permission_name,
    ):
        if not request.user or not request.user.is_authenticated:
            raise PermissionError("Authentication required")

        if (
            hasattr(request, "required_permission")
            and request.required_permission != permission_name
        ):
            raise PermissionError("Permission denied")

        if queryset.count() > cls.MAX_ROWS:
            raise ValueError(
                "Export exceeds the maximum allowed size of 10000 rows"
            )

        workbook = Workbook(write_only=True)

        sheet = workbook.create_sheet(title=resource_name)

        sheet.append(headers)

        for row in rows(queryset):

            normalized = []

            for value in row:

                # Fix timezone-aware datetime
                if isinstance(value, datetime):
                    if value.tzinfo is not None:
                        value = value.replace(tzinfo=None)

                    normalized.append(value)

                # Convert JSON objects
                elif isinstance(value, (dict, list)):
                    normalized.append(json.dumps(value, default=str))

                else:
                    normalized.append(value)

            sheet.append(normalized)

        buffer = io.BytesIO()

        workbook.save(buffer)

        buffer.seek(0)

        AuditLog.objects.create(
            actor=request.user,
            action="excel.export",
            target_type=resource_name,
            target_id="",
            changes={
                "resource": resource_name,
                "row_count": queryset.count(),
            },
            ip=request.META.get("REMOTE_ADDR"),
        )

        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        return response


class PermissionService:
    """
    Resolves and caches RBAC permissions for roles and users.
    """

    @staticmethod
    @lru_cache(maxsize=512)
    def role_permissions(role_id):
        return set(
            Permission.objects.filter(
                role_permissions__role_id=role_id
            ).values_list("codename", flat=True)
        )

    @classmethod
    def get_user_permissions(cls, user, request=None):
        if request is not None:
            cache = getattr(request, "_rbac_permission_cache", None)

            if cache is None:
                cache = {}
                setattr(request, "_rbac_permission_cache", cache)

            cache_key = getattr(user, "pk", "anonymous")

            if cache_key in cache:
                return cache[cache_key]

        permissions = set()

        user_roles = user.user_roles.select_related("role").all()

        for user_role in user_roles:
            permissions.update(
                cls.role_permissions(user_role.role_id)
            )

        if request is not None:
            getattr(
                request,
                "_rbac_permission_cache",
                {},
            )[cache_key] = permissions

        return permissions

    @classmethod
    def resolve_permission(
        cls,
        user,
        permission_name,
        request=None,
    ):
        return permission_name in cls.get_user_permissions(
            user,
            request=request,
        )
from django.contrib import admin
from django.db.models import Count

from .models import (
    Permission,
    Role,
    RolePermission,
    UserRole,
)


# ==========================================================
# Inline Permission Management
# ==========================================================

class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    autocomplete_fields = ("permission",)


# ==========================================================
# Role Admin
# ==========================================================

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_system",
        "permission_count",
        "user_count",
        "created_at",
    )

    list_filter = (
        "is_system",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        RolePermissionInline,
    ]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        return queryset.annotate(
            total_permissions=Count("role_permissions"),
            total_users=Count("user_roles"),
        )

    @admin.display(description="Permissions")
    def permission_count(self, obj):
        return obj.total_permissions

    @admin.display(description="Users")
    def user_count(self, obj):
        return obj.total_users

    def has_delete_permission(self, request, obj=None):
        if obj and obj.is_system:
            return False
        return super().has_delete_permission(request, obj)


# ==========================================================
# Permission Admin
# ==========================================================

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):

    list_display = (
        "codename",
        "description",
        "created_at",
    )

    search_fields = (
        "codename",
        "description",
    )

    ordering = (
        "codename",
    )

    readonly_fields = (
        "created_at",
    )


# ==========================================================
# User Role Admin
# ==========================================================

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "role",
        "assigned_at",
    )

    search_fields = (
        "user__email",
        "user__full_name",
        "role__name",
    )

    list_filter = (
        "role",
        "assigned_at",
    )

    autocomplete_fields = (
        "user",
        "role",
    )

    ordering = (
        "-assigned_at",
    )

    readonly_fields = (
        "assigned_at",
    )


# ==========================================================
# Role Permission Admin
# ==========================================================

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):

    list_display = (
        "role",
        "permission",
    )

    search_fields = (
        "role__name",
        "permission__codename",
    )

    list_filter = (
        "role",
    )

    autocomplete_fields = (
        "role",
        "permission",
    )